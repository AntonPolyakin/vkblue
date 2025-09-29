import * as cheerio from 'cheerio';
import get from 'lodash/get';

import { storageGet, storageSet } from '../../source/modules/LocalStorage/storage';

import { LASTFM_GET_INFO } from './action-types';

import clearString from './utils/clear_string';
import getTrack from './api/get-track-info';
import getArtist from './api/get-artist-info';
import { on } from '../../source/modules/Port/background';

import { TRACKS_STORAGE_KEY } from '../../source/store/tracks/constants';
import { ARTISTS_STORAGE_KEY } from '../../source/store/artists/constants';

const getArtistKey = ({ artist = '' }) => `${artist.toLowerCase()}`;
const getTrackKey = ({ artist = '', title = '' }) => `${artist.toLowerCase()}-${title.toLowerCase()}`;

on(LASTFM_GET_INFO, async request => {
    try {
        const artist = clearString(request.artist);
        const title = clearString(request.title);

        const {
            ARTISTS_STORAGE_KEY: artistsStorage = {},
            TRACKS_STORAGE_KEY: tracksStorage = {}
        } = await storageGet([ARTISTS_STORAGE_KEY, TRACKS_STORAGE_KEY]);

        const trackKey = getTrackKey({ artist, title });
        const artistKey = getArtistKey({ artist });

        const trackCache = tracksStorage?.[trackKey];
        const artistCache = artistsStorage[artistKey];

        if (trackCache && artistCache) {
            return {
                artist: artistCache,
                track: trackCache
            };
        }

        let trackInfo = await getTrack({ artist, title });

        let artistName = get(trackInfo, 'track.artist.name', artist);
        let artistMbid = get(trackInfo, 'track.artist.mbid', null);

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

        artistResult.image = await new Promise(async resolve => {
            try {
                const res = await fetch(artistResult.url);
                const body = await res.text();

                const $ = cheerio.load(body);
                const image = $('.header-new-background-image');
                const content = image ? image.attr('content') : null;

                if (!content) {
                    resolve([{ '#text': null }]);
                    return;
                }

                resolve([{ ['#text']: content }]);
            } catch (error) {
                resolve([{ '#text': null }]);
            }
        });

        const trackResult = trackInfo ? trackInfo.track : null;

        let storage = {};

        if (trackResult) {
            Object.assign(storage, {
                TRACKS_STORAGE_KEY: Object.assign(tracksStorage, { [trackKey]: trackResult }),
            });
        }

        if (artistResult) {
            Object.assign(storage, {
                ARTISTS_STORAGE_KEY: Object.assign(artistsStorage, { [artistKey]: artistResult }),
            });
        }

        if (Object.keys(storage)) {
            await storageSet(storage);
        }

        return {
            artist: artistResult,
            track: trackResult
        };

    } catch (error) {
        console.error(error);
        return {
            artist: null,
            track: null
        };
    }
});
