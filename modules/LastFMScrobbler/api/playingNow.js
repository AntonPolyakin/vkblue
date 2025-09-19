import request from './utils/request';

export const playingNow = ({ artist, track, sk }) => {
    const payload = {
        artist,
        track,
        method: 'track.updateNowPlaying',
        api_key: process.env.LAST_FM_API_KEY,
    };

    return request({ method: 'POST', sk, data: payload });
}
