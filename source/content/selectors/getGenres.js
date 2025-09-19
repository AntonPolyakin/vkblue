import get from 'lodash/get';
import uniq from 'lodash/uniq';
import trim from 'lodash/trim';

export default function getGenres(state) {
    const { lastfm } = state.data;
    const trackGenres = get(lastfm, 'track.toptags.tag', []);
    const artistGenres = get(lastfm, 'artist.tags.tag', []);
    const genres = [...trackGenres, ...artistGenres]
        .map(({ name }) => {
            let genre = name.toLowerCase();
            genre = genre.replace(/^\s+|\s+$/g, '');
            genre = trim(genre);

            return genre;
        })
        .filter(genre => {
            const hasNumbers = /\d/.test(genre);
            const moreThanThreeWords = genre.split(' ').length > 3;
            const isTooLarge = genre.length > 30;

            return !(hasNumbers || moreThanThreeWords || isTooLarge);
        });

    return uniq(genres);
}
