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

const removeNumerationSubstring = (str) => {
    let numerationSubstringRegExp = /^\d+\s*[\)\]]?\s*[\.\-\,\:]\s*/gm;
    let res = str.replace(numerationSubstringRegExp, '');
    return res;
}

export const removeYearSubstring = (str) => {
    let yearSubstringRegExp = /\s*[\(\[]?\s*\d{4}\s*[\)\]]?\s*$/gm;
    let yearStr = str.match(yearSubstringRegExp)?.[0] || '';

    let year = Number.parseInt(yearStr?.match('\\d+')?.[0] || '');
    let res = str;
    let parts = str.split(/\s+/g);

    let touchesStart = (str.indexOf(yearStr) == 0);
    let touchesEnd = (str.indexOf(yearStr) + yearStr.length) == str.length;

    let yearIsNamingPart = (parts.length <= 2 && parts.some(item=>['the'].includes(item)));
    if(
        (year > 1000) && 
        (year < (new Date()).getFullYear() + 1) &&
        (touchesStart || touchesEnd) &&
        parts.length > 2 && 
        !yearIsNamingPart
    ){
        res = str.replace(yearSubstringRegExp, '');
    }
    
    return res;
}


export const clearTrackString = (source) => {
    let result = decodeHtml(source);
    result = deburr(result);
    result = removeNumerationSubstring(result);
    result = removeAlbumSubstring(result)
    result = result
        .replace(regExpPatterns.bracketsContent, '')
        .replace(regExpPatterns.sentenceGarbageRegExp, ' ')
        .replace(regExpPatterns.extraSpacesRegExp, ' ');
    result = trim(result);

    return result;
};
