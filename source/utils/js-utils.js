export function waitForElement(selector, context, options) {
    context = context || document;
    const { timeout, waitForMissing} = options || {};
    let timer;
    let observer;
    return new Promise((resolve, reject) => {
  
      let handleElement = () => {
        let condition = context?.querySelector(selector);
        if (waitForMissing ? !condition : condition) {
            resolve(waitForMissing ? true : condition || null);
            if (observer) observer.disconnect();
        }
      }
  
      handleElement();
  
      observer = new MutationObserver(mutations => {
        handleElement();
      });
  
      observer.observe(context, {
        childList: true,
        subtree: true
      });
  
      if (timeout) {
        const handleTimeout = () => {
          clearTimeout(timer);
          observer.disconnect();
          resolve(null);//new Error('Timeout waiting for element')
        };
        timer = setTimeout(handleTimeout, timeout);
      }
    });
}

export function CSSToObject(cssText) {
    var regex = /([\w-]*)\s*:\s*([^;]*)/g;
    var match, properties = {};
    while (match = regex.exec(cssText)) properties[match[1]] = match[2].trim();
    return properties;
}

export function objectToCSS(style) {
    return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')
}

export function clampToRange(value, range) {
  const [start, end] = range;

  if (value >= Math.min(start, end) && value <= Math.max(start, end)) {
      return value;
  } else if (Math.abs(value - start) < Math.abs(value - end)) {
      return start;
  } else {
      return end;
  }
}

export function onDocumentReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}


/**
 * Generates a random string of a specified length using a custom character set.
 * 
 * @param {number} i - The length of the random string to generate.
 * @param {string} [chars] - The character set to use for generating the string. Defaults to alphanumeric characters.
 * @returns {string} A random string of the specified length.
 * @tags #string #random #utility
 * @altname randomString
 */
export function getRandomString(i, chars) {
  chars = chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";//Math.random().toString(36).substring(2);
  var rnd = '';
  while (rnd.length < i) {
    rnd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rnd;
};


/**
 * Filters the properties of an object or elements of an array based on a callback function.
 * 
 * @param {Object|Array} obj - The object or array to filter.
 * @param {Function} filtercheck - A callback function that determines whether a property or element should be included. 
 * It receives `(key, value, index, array)` as arguments.
 * @return {Object|Array} - A new object or array containing only the filtered properties or elements.
 * @tags #object #array #filter #utility
 */
export function objectFilter(obj, filtercheck) {
  let isArray = Array.isArray(obj);
  let result = isArray ? [] : {};
  Object.keys(obj).forEach((key, i, array) => {
    if (filtercheck(key, obj[key], i, array)) {
      if (isArray) {
        result.push(obj[key]);
      } else {
        result[key] = obj[key];
      }
    };
  })
  return result;
};



/**
 * Compares multiple strings in a case-insensitive and format-independent manner.
 * 
 * @param {...string} strings - The strings to compare.
 * @return {boolean} - `true` if all strings are equivalent, otherwise `false`.
 * @tags #string #comparison #utility
 */
export function caseIndependentCompare(...strings) {
  if (strings.length < 2) {
    return false;
  }

  for (let i = 1; i < strings.length; i++) {
    let parseString = (str) => str.split(/(?<!\p{Lu})(?=\p{Lu})|-| |_|\./gum).filter(item => item && !/^[^\p{L}\d]$/ui.test(item));
    let formatStringArray = (arr) => arr.join('').toLowerCase();
    if (formatStringArray(parseString(strings[i])) !== formatStringArray(parseString(strings[0]))) {
      return false;
    }
  }

  return true;
}


/**
 * Sorts an array of objects based on specified rules and an optional sorting function.
 *
 * @param {Array<Object>} array - The array of objects to sort.
 * @param {Array<Object|string>|Object|string} rules - Sorting rules, which can be an array of rules or a single rule.
 * @param {Function} [sortFunction] - An optional sorting function to use instead of the default Array.sort().
 * @returns {Array<Object>} A new array of objects sorted according to the specified rules.
 * @tags #array #object #sorting #converter
 * @altname multiSort
 */
export function sortArrayOfObjects(array, rules, sortFunction) {
  const newArray = [...array];
  sortFunction = sortFunction || ((arr, fn) => arr.sort(fn));
  const sortingRules = Array.isArray(rules) ? rules : [rules];

  return sortFunction(newArray, (a, b) => {
    for (let rule of sortingRules) {
      let result = 0;
      let direction = 'asc';

      if (typeof rule === 'object') {
        // Defining the sorting direction
        if (rule.order === 'desc') direction = 'desc';
        if (rule.order === 'asc') direction = 'asc';

        if (rule.negative) {
          // Invert the direction if negative is set
          direction = direction === 'asc' ? 'desc' : 'asc';
        }

        const dir = direction === 'asc' ? 1 : -1;

        if ('func' in rule && typeof rule.func === 'function') {
          result = dir * (Number(rule.func(a, b)) || 0);
        } else if ('field' in rule) {
          const field = rule.field;
          const isDate = rule.isDate;
          const isNumber = rule.isNumber;
          const ignoreCase = rule.ignoreCase;

          let aValue = a?.[field];
          let bValue = b?.[field];

          if (isDate) {
            aValue = aValue ? new Date(aValue) : new Date(0);
            bValue = bValue ? new Date(bValue) : new Date(0);
          } else if (isNumber) {
            aValue = Number(String(aValue).replace(/\D/g, ''));
            bValue = Number(String(bValue).replace(/\D/g, ''));
          } else if (ignoreCase && typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (aValue > bValue) {
            result = dir;
          } else if (aValue < bValue) {
            result = -dir;
          }
        }
      } else if (typeof rule === 'string') {
        let dir = 1;
        if (rule[0] === '-') {
          dir = -1;
          rule = rule.substring(1);
        }
        const field = rule;
        let aValue = a?.[field];
        let bValue = b?.[field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue > bValue) {
          result = dir;
        } else if (aValue < bValue) {
          result = -dir;
        }
      }

      if (result !== 0) {
        return result;
      }
    }
    return 0;
  });
}