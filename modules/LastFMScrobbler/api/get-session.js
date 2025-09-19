import request from './utils/request';

export default function getSession(token) {
    const payload = {
        method: 'auth.getSession',
        token: token,
        api_key: process.env.LAST_FM_API_KEY,
    };

    return request({ method: 'GET', data: payload });
}
