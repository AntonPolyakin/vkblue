export function clearSpreadMoreString(source, blacklistSubstrings) {
    let sentences = source.split(regExpPatterns.sentenceSplitter);

    blacklistSubstrings = blacklistSubstrings || ['read more', '…'];

    for (let i = sentences.length - 1; i >= 0; i--) {
        const sentence = sentences[i];

        if (
            blacklistSubstrings.some(pattern => {
                if (pattern instanceof RegExp) {
                    return pattern.test(sentence);
                }
                return sentence.toLowerCase().includes(pattern);
            })
        ) {
            sentences[i] = '';
        } else {
            break;
        }
    }

    return sentences.join('');
}