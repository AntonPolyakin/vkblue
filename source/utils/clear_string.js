'use string';

import trim from 'lodash/trim';

export default function(input) {
    const doc = new DOMParser().parseFromString(input, 'text/html');

    let string = doc.documentElement.textContent;
    string = string.replace(/`/g, "'");
    string = trim(string);

    return string;
}
