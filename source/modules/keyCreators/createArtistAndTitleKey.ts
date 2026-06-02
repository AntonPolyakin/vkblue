import { clearTrackString } from '../../../modules/LastFMInfo/utils/clear_track_string';

export const createArtistAndTitleKey = (artist: string, title: string) => {
    let artistStr = clearTrackString(artist).toLowerCase();
    let titleStr = clearTrackString(title).toLowerCase();
    return `${artistStr}--${titleStr}`;
};
