import _request from 'request';
import cheerio from 'cheerio';
import get from 'lodash/get';

import { storageGet, storageSet } from '../../source/modules/LocalStorage/storage';

import { LASTFM_GET_INFO } from './action-types';

import clearString from './utils/clear_string';
import getTrack from './api/get-track-info';
import getArtist from './api/get-artist-info';
import { on } from '../../source/modules/Port/background';

const getArtistKey = ({ artist = '' }) => `${artist.toLowerCase()}`;
const getTrackKey = ({ artist = '', title = '' }) => `${artist.toLowerCase()}-${title.toLowerCase()}`;

on(LASTFM_GET_INFO, async request => {
    const artist = clearString(request.artist);
    const title = clearString(request.title);

    const trackKey = getTrackKey({ artist, title });
    const trackCache = await storageGet(trackKey);
    if (trackCache) {
        return trackCache;
    }

    let trackInfo = await getTrack({ artist, title });

    let artistName = get(trackInfo, 'track.artist.name', artist);
    let artistMbid = get(trackInfo, 'track.artist.mbid', null);

    const artistKey = getArtistKey({ artist });
    const artistCache = await storageGet(artistKey);
    let artistInfo = null;

    if (artistCache) {
        artistInfo = artistCache;
    } else {
        artistInfo = await getArtist({ artist: artistName, mbid: artistMbid });
    }

    const artistResult = get(artistInfo, 'ru.artist', get(artistInfo, 'en.artist', {}));

    if (!get(artistInfo, 'ru.artist.bio.content', null)) {
        artistResult.bio = get(artistInfo, 'en.artist.bio', {});
    }

    artistResult.image = await new Promise(resolve => {
        _request(artistResult.url, function(error, response, body) {
            if (error) {
                resolve([{ '#text': null }]);
                return;
            }

            const $ = cheerio.load(body);
            const image = $('.header-new-background-image');
            const content = image ? image.attr('content') : null;

            if (!content) {
                resolve([{ '#text': null }]);
                return;
            }

            resolve([{ ['#text']: content }]);
        });
    });

    const result = {
        artist: artistResult,
        track: trackInfo ? trackInfo.track : null,
    };

    await storageSet(trackKey, result);

    return result;
});
