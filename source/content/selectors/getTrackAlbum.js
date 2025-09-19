import get from 'lodash/get';

export default function getTrackAlbum(state) {
    return get(state.data.lastfm, 'track.album.title', null);
}
