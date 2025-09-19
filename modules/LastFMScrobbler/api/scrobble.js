import request from './utils/request';

export default function scrobble({ artist, track, sk }) {
    const payload = {
        artist,
        track,
        method: 'track.scrobble',
        timestamp: parseInt(Date.now() / 1000, 10),
        chosenByUser: 0,
        api_key: process.env.LAST_FM_API_KEY,
    };

    return request({ method: 'POST', sk, data: payload });
}
