function escapeRegex(string) {
    return string.replace(/[\[\](){}?*+\^$\\.|\-]/g, '\\$&');
}

export default function(str, characters, flags) {
    flags = flags || 'g';
    if (typeof str !== 'string' || typeof characters !== 'string' || typeof flags !== 'string') {
        throw new TypeError('argument must be string');
    }

    if (!/^[gi]*$/.test(flags)) {
        throw new TypeError("Invalid flags supplied '" + flags.match(new RegExp('[^gi]*')) + "'");
    }

    characters = escapeRegex(characters);

    return str.replace(new RegExp('^[' + characters + ']+|[' + characters + ']+$', flags), '');
}
