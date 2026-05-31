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