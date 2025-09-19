import get from 'lodash/get';

export default function getBio(state) {
    return get(state.data.lastfm, 'artist.bio.links.link.href', null);
}
