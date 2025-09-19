import get from 'lodash/get';

export default function getAlbumPicture(state) {
    const albumPictures = get(state.data.lastfm, 'track.album.image', []);
    const length = albumPictures.length;

    if (length === 0) {
        return null;
    } else {
        return albumPictures[length - 1]['#text'];
    }
}
