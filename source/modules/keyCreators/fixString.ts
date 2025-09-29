import trim from 'lodash/trim';
import unescape from 'lodash/unescape';
import deburr from 'lodash/deburr';

const decodeHtml = (html: string): string => {
  return html.replace(/&[#A-Za-z0-9]+;/g, match => unescape(match));
};

export const fixString: (source: string) => string = source => {
    let result: string;

    result = decodeHtml(source);
    result = deburr(result);
    result = result
        .replace(/(\s)+/g, ' ')
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*\[.*?]\s*/g, '')
        .replace(/[^\wа-яёі&.Λ]+/gi, ' ');
    result = trim(result);

    return result;
};
