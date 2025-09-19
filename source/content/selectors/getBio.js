import get from 'lodash/get';

export default function getBio(state) {
    const content = get(state.data.lastfm, 'artist.bio.content', '');
    const summary = get(state.data.lastfm, 'artist.bio.summary', '');

    let bio = content.length > summary.length ? content : summary;

    return bio.split('<a')[0];
}
