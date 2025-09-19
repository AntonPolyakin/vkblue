import get from 'lodash/get';
import request from './utils/request';

const getTrackInfo = async function(params) {
    let searchResult = {};

    try {
        const data = {
            method: 'track.search',
            artist: params.artist,
            track: params.title,
            api_key: process.env.LAST_FM_API_KEY,
            autocorrect: '1',
        };

        searchResult = await request({ method: 'GET', data });
    } catch (error) {
        console.error(error);
    }

    const artist = get(searchResult, 'results.trackmatches.track[0].artist', params.artist);
    const track = get(searchResult, 'results.trackmatches.track[0].name', params.title);

    let result = null;

    try {
        const data = {
            method: 'track.getInfo',
            artist: artist,
            track: track,
            api_key: process.env.LAST_FM_API_KEY,
            format: 'json',
            autocorrect: '1',
        };

        result = await request({ method: 'GET', data });
    } catch (error) {
        console.error(error);
    }

    return result;
};

export default getTrackInfo;
