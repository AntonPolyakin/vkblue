import get from 'lodash/get';

export default function getArtistPicture(state) {
    const artistPictures = get(state.data.lastfm.artist, 'image', []);
    const length = artistPictures.length;
    const cover = get(state.data.vk.base, 'cover_url', '').split(',')[1];
    let result = null;

    if (length === 0) {
        result = cover ? cover : null;
    } else {
        const image = artistPictures[length - 1]['#text'];

        if (typeof image === 'string' && !image.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
            result = image;
        } else {
            result = cover ? cover : null;
        }
    }

    return result;
}
