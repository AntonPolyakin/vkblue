import * as cheerio from 'cheerio';
import get from 'lodash/get';

import { storageGet, storageSet } from '../../source/modules/LocalStorage/storage';

import { LASTFM_GET_INFO } from './action-types';

import { clearTrackString } from './utils/clear_track_string';
import { clearSpreadMoreString } from './utils/clear_spread_more_string.js'; 
import getTrack from './api/get-track-info';
import getArtist from './api/get-artist-info';
import { on } from '../../source/modules/Port/background';

import { TRACKS_STORAGE_KEY } from '../../source/store/tracks/constants';
import { ARTISTS_STORAGE_KEY } from '../../source/store/artists/constants';

import { fetchWebArchive } from './utils/web_archive';
import { regExpPatterns, longestElement, shortestElement } from '../../source/utils/js-utils';

const getArtistKey = ({ artist = '' }) => `${artist.toLowerCase()}`;
const getTrackKey = ({ artist = '', title = '' }) => `${artist.toLowerCase()}-${title.toLowerCase()}`;

on(LASTFM_GET_INFO, async request => {
    try {
        const artist = clearTrackString(request.artist);
        const title = clearTrackString(request.title);

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
        let artistPage, $;
        try {
            const artistUrl = artistResult.url;
            if (!artistUrl) {
                throw null;
            }
            artistPage = await (await fetchWebArchive(artistUrl)).text();
            const body = artistPage;
            $ = body ? cheerio.load(body) : null;

        } catch (error) {
            $ = null;
        }
        let hasArtistPage = !!(artistPage && $);

        artistResult.bio = (() => {
            let res;
            let bio= {
                ru: get(artistInfo, 'ru.artist.bio', null),
                en: get(artistInfo, 'en.artist.bio', null)
            };

            let preferredLang = 'ru';
            let basicLang = 'en';

            res = bio[preferredLang]?.content ? bio[preferredLang] : bio[basicLang];

            if (!res?.content && hasArtistPage) {

                const texts = $('.wiki-block-inner')
                    ?.map((_, el) => $(el).text())
                    ?.get() || [];

                for (let index = 0; index < texts.length; index++) {
                    const text = texts[index];

                    texts[index] = clearSpreadMoreString(text);
                }

                res = {
                    content: longestElement(texts),
                    links:{
                        '#text': "",
                        href: artistResult.url + "/+wiki",
                        rel: "original",
                    },
                    published: '',//"31 Dec 2007, 06:04",
                    summary: shortestElement(texts)
                };
            }

            return res || {};
        })()


        artistResult.image = await new Promise(async resolve => {
            try {
                const artistUrl = artistResult.url;
                if (!hasArtistPage) {
                    throw null;
                }

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
