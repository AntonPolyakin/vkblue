import trim from 'lodash/trim';
import unescape from 'lodash/unescape';
import deburr from 'lodash/deburr';
import { regExpPatterns, splitFirst } from '../../../source/utils/js-utils';

const decodeHtml = (html) => {
    return html.replace(/&[#A-Za-z0-9]+;/g, match => unescape(match));
};

const removeAlbumSubstring = (str) => {
    const sentenceDashesRegExp = regExpPatterns.sentenceGarbage;
    const bracketsContentRegExp = regExpPatterns.bracketsContent;
    let res = str;

    if(sentenceDashesRegExp.test(str) && bracketsContentRegExp.test(str)){
        let parts = splitFirst(str, sentenceDashesRegExp);
        if(bracketsContentRegExp.test(parts[1])){
            res = parts?.[0]; 
        }
    }

    return res;
}

export const clearTrackString = (source) => {
    let result = decodeHtml(source);
    result = deburr(result);
    result = removeAlbumSubstring(result)
    result = result
        .replace(regExpPatterns.bracketsContent, '')
        .replace(regExpPatterns.sentenceGarbageRegExp, ' ')
        .replace(regExpPatterns.extraSpacesRegExp, ' ');
    result = trim(result);

    return result;
};
