export default function(text, length) {
    if (typeof text !== 'string') {
        return '';
    }

    if (typeof length !== 'number') {
        return '';
    }

    let truncatedText = text.substr(0, length);

    truncatedText = truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')));

    if (text.length > truncatedText.length) {
        truncatedText += '...';
    }

    return truncatedText;
}
