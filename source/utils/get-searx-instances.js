
const SORT_CRITERIAS = [
  'http.status_code',
  'error',
  'timing.search.error',
  'timing.search_go.error',
  'version',
  'tls.grade',
  'http.grade',
  'html.grade',
  'timing.search.all',
  'url'
];

const HTML_GRADE_MAPPING = {
  'V': 3,
  'V, ?': 3,
  'V, js?': 3,

  'F': 3,
  'F, ?': 3,
  'F, js?': 3,

  'C': 3,
  'C, ?': 3,
  'C, js?': 3,

  'Cjs': 3,
  'Cjs, ?': 3,
  'Cjs, js?': 3,

  'E': 0,
  'E, ?': 0,
  'E, js?': 0,
  '👁️': 0,

  '?': -1,
  'js?': -1,
}




function getValue(f, obj, ...keys) {
  let value = obj;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k === undefined) {
      break;
    }
    if ((value === undefined)
      || (!value.hasOwnProperty(k))) {
      value = undefined;
      break;
    }
    value = value[k];
  }
  if (value !== undefined && f !== null) {
    value = f(value);
  }
  return value;
}

function setDefault(obj, key, value) {
  if (obj[key] == null) {
    // eslint-disable-next-line no-param-reassign
    obj[key] = value;
  }
}

function listUniq(l) {
  return [...new Set(l)];
}

function normalizeSearxVersion(v) {
  if (typeof (v) !== 'string') {
    return [0, 0, 0, 0, ''];
  }
  const vdate = v.replaceAll("+", "-").split("-")[0].replaceAll('.', "-")
  const asDate = new Date(vdate);
  if (!isNaN(asDate)) {
    // version format "YYYY.MM.DD-HASH" (for example "2022.03.01-0ddcc124")
    // group version per month
    const relativeDate = asDate.getYear() * 12 + asDate.getMonth();
    const hash = v.split("-")[1];
    return [relativeDate, 0, 0, 0, hash];
  }
  // version format "MAJOR.MINOR.PATCH-DISTANCE-HASH" (for example "1.0.0-356-c9e6d9f5")
  const vdash = v.split(/[\-\+]/);
  const vdot = vdash[0].split('.').map((i) => parseInt(i, 10));
  if (vdash.length === 1) {
    return [vdot[0], vdot[1], vdot[2], 0, ''];
  }
  if (vdash[1] === 'unknow') {
    return [vdot[0], vdot[1], vdot[2], 0, ''];
  }
  return [vdot[0], vdot[1], vdot[2], parseInt(vdash[1], 10), vdash[2]];
}

function normalizeGrade(grade) {
  if (grade === undefined || grade === null) {
    return '';
  }
  if (grade === '?') {
    return -1;
  }
  const result = ('G'.codePointAt(0) - grade.codePointAt(0)) * 3 + 1;
  if (grade.length === 2 && grade.endsWith('+')) {
    return result + 1;
  }
  if (grade.length === 2 && grade.endsWith('-')) {
    return result - 1;
  }
  return result;
}

function normalizeHtmlGrade(grade) {
  if (grade === undefined || grade === null) {
    return -1;
  }
  const ngrade = HTML_GRADE_MAPPING[grade];
  if (ngrade === undefined) {
    return -1;
  }
  return ngrade;
}

function compareTool(a, b, f, ...keys) {
  const va = getValue(f, a, ...keys);
  const vb = getValue(f, b, ...keys);
  if (va === '' && vb !== '') {
    return 1;
  }
  if (vb === '' && va !== '') {
    return -1;
  }
  if (va === undefined && vb !== undefined) {
    return -1;
  }
  if (va !== undefined && vb === undefined) {
    return 1;
  }
  if (va < vb) {
    return 1;
  }
  if (va > vb) {
    return -1;
  }
  return 0;
}

function compareVersion(a, b) {
  const nsva = normalizeSearxVersion(a);
  const nsvb = normalizeSearxVersion(b);
  for (let i = 0; i < 3; i += 1) {
    const result = compareTool(nsva, nsvb, null, i);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}


function getTime(timing) {
  if (timing.value !== undefined) {
    return timing.value;
  }
  if (timing.median !== undefined) {
    return timing.median;
  }
  return undefined;
}

function isError(timing) {
  if (timing.success_percentage < 100) {
    return 100 - timing.success_percentage;
  }
  if (timing.error !== undefined) {
    return 100;
  }
  return 0;
}

const CompareFunctionCriterias = {
  'http.status_code': (a, b) => -compareTool(a, b, null, 'http', 'status_code'),
  'error': (a, b) => -compareTool(a, b, null, 'error'),
  'network.asn_privacy': (a, b) => compareTool(a, b, null, 'network', 'asn_privacy'),
  'version': (a, b) => compareVersion(a.version, b.version),
  'tls.grade': (a, b) => compareTool(a, b, normalizeGrade, 'tls', 'grade'),
  'html.grade': (a, b) => compareTool(a, b, normalizeHtmlGrade, 'html', 'grade'),
  'http.grade': (a, b) => compareTool(a, b, normalizeGrade, 'http', 'grade'),
  'timing.initial.all': (a, b) => -compareTool(a, b, getTime, 'timing', 'initial', 'all'),
  'timing.search.error': (a, b) => -compareTool(a, b, isError, 'timing', 'search'),
  'timing.search_go.error': (a, b) => -compareTool(a, b, isError, 'timing', 'search_go'),
  'timing.search.all': (a, b) => -compareTool(a, b, getTime, 'timing', 'search', 'all'),
  'timing.search_wp.all': (a, b) => -compareTool(a, b, getTime, 'timing', 'search_wp', 'all'),
  'url': (a, b) => -compareTool(a, b, null, 'url'),
};

export function getSearxInstances(instances) {

  let _this = {
    instances: instances,
    filters: {
      fork_select: '',
      version: '',
      html_grade: '',
      csp_grade: '',
      tls_grade: '',
      ipv6: false,
      asn_privacy: false,
      network_name: '',
      network_country: '',
      standard_search: false,
      engines: {

      },
      well_known_engines: true,
    }
  }

  function compareFunctionCompose(...criterias) {
    const criteriaFunctions = criterias.map((criteriaName) => CompareFunctionCriterias[criteriaName]);
    for (let i = 0; i < criteriaFunctions.length; i += 1) {
      if (typeof criteriaFunctions[i] !== 'function') {
        throw "criteria #" + i + " " + criterias[i] + " is not a function (" + criteriaFunctions[i] + ")";
      }
    }
    return (a, b) => {
      for (let i = 0; i < criteriaFunctions.length; i += 1) {
        const result = criteriaFunctions[i](a, b);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    };
  }

  function applyStrFilter(r, filterValue, f) {
    if (typeof filterValue === 'undefined' || filterValue === null) {
      return r;
    }
    const filterValueStriped = filterValue.trim().toLowerCase();
    if (filterValueStriped === '') {
      return r;
    }
    return r.filter((detail) => f(filterValueStriped, detail));
  }

  let instances_filtered = function () {
    let result = _this.instances;
    if (_this.filters.fork_select != '') {
      result = result.filter((detail) => detail.git_url == _this.filters.fork_select)
    }
    result = applyStrFilter(result, _this.filters.version, (f, detail) => filterStartsWith(f, detail.version));
    result = applyStrFilter(result, _this.filters.csp_grade, (f, detail) => filterIndexOf(f, detail.http.grade));
    result = applyStrFilter(result, _this.filters.tls_grade, (f, detail) => filterIndexOf(f, detail.tls.grade));
    result = applyStrFilter(result, _this.filters.html_grade,
      (f, detail) => filterIndexOf(f, detail.html.grade));
    result = applyStrFilter(result, _this.filters.network_name,
      (f, detail) => {
        for (const ipInfo of Object.values(detail.network.ips)) {
          if (ipInfo.asn_cidr) {
            const asn_cidr = this.cidrs[ipInfo.asn_cidr];
            const network = asn_cidr.network_name || asn_cidr.asn_description || '';
            return network.toLowerCase().indexOf(f) >= 0;
          }
        }
        return false;
      });
    result = applyStrFilter(result, _this.filters.network_country,
      (f, detail) => {
        for (const ipInfo of Object.values(detail.network.ips)) {
          if (ipInfo.asn_cidr) {
            const asn_cidr = this.cidrs[ipInfo.asn_cidr]
            const country = asn_cidr.network_country || asn_cidr.asn_country_code || '';
            return country.toLowerCase().indexOf(f) >= 0;
          }
        }
        return false;
      });
    for (let [engine_name, no_error] of Object.entries(_this.filters.engines)) {
      if (no_error) {
        result = result.filter((detail) => {
          let engine_detail = detail.engines[engine_name];
          if (engine_detail === undefined) {
            return false;
          }
          if (engine_name == 'google' && detail.timing.search_go.success_percentage === 0) {
            return false;
          }
          if (engine_detail['error_rate']) {
            return engine_detail['error_rate'] <= 10;
          }
          if (engine_detail['checker'] && engine_detail['checker']['simple']) {
            return engine_detail['checker']['simple'].length == 0;
          }
          return true;
        })
      }
    }
    if (_this.filters.ipv6) {
      result = result.filter((detail) => detail.network.ipv6 == true);
    }
    if (_this.filters.asn_privacy) {
      result = result.filter((detail) => detail.network.asn_privacy >= 0);
    }
    if (_this.filters.standard_search) {
      result = result.filter((detail) => detail.timing.search.success_percentage > 0);
    }
    // sort
    const compareInstance = compareFunctionCompose(...SORT_CRITERIAS);
    result.sort(compareInstance);
    return result;
  }

  return instances_filtered();
}