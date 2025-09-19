import get from 'lodash/get';
import request from './utils/request';

const getArtistInfo = async function(params) {
    let mbid = null;

    if (!params.mbid) {
        try {
            const data = {
                artist: params.artist,
                method: 'artist.search',
                api_key: process.env.LAST_FM_API_KEY,
                autocorrect: '1',
            };

            const search = await request({ method: 'GET', data });

            mbid = get(search, 'results.artistmatches.artist[0].mbid', null);
        } catch (error) {
            console.error(error);
        }
    }

    let result = {};
    let ru = null;
    let en = null;

    try {
        const data = {
            ...(mbid ? { mbid } : {}),
            ...(mbid ? {} : { artist: params.artist }),
            method: 'artist.getInfo',
            api_key: process.env.LAST_FM_API_KEY,
            format: 'json',
            autocorrect: '1',
            lang: 'ru',
        };

        ru = await request({ method: 'GET', data });

        if (ru instanceof Object && !('error' in ru)) {
            result.ru = ru;
        }
    } catch (error) {
        console.error(error);
    }

    try {
        const data = {
            ...(mbid ? { mbid } : {}),
            ...(mbid ? {} : { artist: params.artist }),
            method: 'artist.getInfo',
            api_key: process.env.LAST_FM_API_KEY,
            format: 'json',
            autocorrect: '1',
        };

        en = await request({ method: 'GET', data });

        if (en instanceof Object && !('error' in en)) {
            result.en = en;
        }
    } catch (error) {
        console.error(error);
    }

    return result;
};

export default getArtistInfo;
