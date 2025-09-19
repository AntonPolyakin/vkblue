import { LASTFM_AUTH, LASTFM_SCROBBLE, LASTFM_PLAYING_NOW } from './action-types';

import getUserToken from './api/utils/get-user-token';
import getSession from './api/get-session';
import scrobble from './api/scrobble';
import { on } from '../../source/modules/Port/background';
import { playingNow } from './api/playingNow';

const LASTFM_USER_NAME = 'LASTFM_USER_NAME';
const LASTFM_SESSION_KEY = 'LASTFM_SESSION_KEY';

const getSessionKey = async () => {
    let sessionKey = '';

    try {
        const token = await getUserToken();
        const { session } = await getSession(token);

        localStorage[LASTFM_USER_NAME] = session.name;
        localStorage[LASTFM_SESSION_KEY] = session.key;

        sessionKey = session.key;
    } catch (response) {
        localStorage[LASTFM_USER_NAME] = '';
        localStorage[LASTFM_SESSION_KEY] = '';

        console.error(response);
    }

    return sessionKey;
};

on(LASTFM_AUTH, async () => {
    let sessionKey = localStorage[LASTFM_SESSION_KEY];

    sessionKey = sessionKey ? sessionKey : await getSessionKey();

    return sessionKey;
});

on(LASTFM_SCROBBLE, async data => {
    let sessionKey = localStorage[LASTFM_SESSION_KEY];

    if (!sessionKey) {
        return '';
    }

    let response = '';

    try {
        response = await scrobble({
            artist: data.artist,
            track: data.track,
            sk: sessionKey,
        });
    } catch ({ isUnauthorized, error }) {
        if (isUnauthorized) {
            sessionKey = await getSessionKey();
            response = await scrobble({
                artist: data.artist,
                track: data.track,
                sk: sessionKey,
            });
        }
        console.error(error);
    }

    return response;
});

on(LASTFM_PLAYING_NOW, async data => {
    let sessionKey = localStorage[LASTFM_SESSION_KEY];

    if (!sessionKey) {
        return '';
    }

    let response = '';

    try {
        response = await playingNow({
            artist: data.artist,
            track: data.track,
            sk: sessionKey,
        });
    } catch ({ isUnauthorized, error }) {
        if (isUnauthorized) {
            sessionKey = await getSessionKey();
            response = await playingNow({
                artist: data.artist,
                track: data.track,
                sk: sessionKey,
            });
        }
        console.error(error);
    }

    return response;
});
