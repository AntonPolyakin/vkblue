const cache = new Map();

export default async function loadPicture(url) {
    if (!url) {
        return null;
    }

    if (url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    if (cache.has(url)) {
        return cache.get(url);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    cache.set(url, blobUrl);

    return blobUrl;
}