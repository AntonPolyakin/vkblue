const trim = require('lodash/trim');
const unescape = require('lodash/unescape');
const deburr = require('lodash/deburr');

const NODE_DECODER = window.document.createElement('span');

export const fixString: (source: string) => string = source => {
    let result: string;

    NODE_DECODER.innerHTML = source;
    result = NODE_DECODER.innerText;
    result = unescape(result);
    result = deburr(result);
    result = result
        .replace(/(\s)+/g, ' ')
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*\[.*?]\s*/g, '')
        .replace(/[^\wа-яёі&.Λ]+/gi, ' ');
    result = trim(result);

    return result;
};
