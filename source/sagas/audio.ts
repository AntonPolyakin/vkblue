import { call, fork, put, select, takeLatest, throttle } from 'redux-saga/effects';
import { PLAY } from '../store/audio/constants';
import {
    audioAddPlayedPercent,
    audioClearPlayedPercent,
    audioUpdatePause,
    audioUpdatePlay,
    audioUpdatePlaying,
} from '../store/audio/actionCreators';

import fetchLastFM from '../content/fetch/fetch_lastfm';
import {
    FETCH_ARTIST_INFO_FROM_LASTFM_FAILURE,
    FETCH_ARTIST_INFO_FROM_LASTFM_REQUEST,
    FETCH_ARTIST_INFO_FROM_LASTFM_SUCCESS,
    FETCH_TRACK_INFO_FROM_LASTFM_FAILURE,
    FETCH_TRACK_INFO_FROM_LASTFM_REQUEST,
    FETCH_TRACK_INFO_FROM_LASTFM_SUCCESS,
    UPDATE_BASE_FROM_VK,
} from '../content/stores/data/action-types';
import { playingNow, scrobble } from '../../modules/LastFMScrobbler/content';

import { getAudioPlayedPercent } from '../store/audio/selectors';
import { getPresetsAuto } from '../store/presets/selectors';
import { updateAutoPreset } from '../actionCreators/presets';
import { play, playing, timeupdate } from '../actionCreators/audio';
import { PAUSE, PLAYING, TIMEUPDATE } from '../constants';
import { scrobblerNew, scrobblerStart, scrobblerStop, scrobblerSuccess } from '../store/scrobbler/actionCreators';
import { getScrobblerEnabled } from '../store/scrobbler/selectors';



function* handleAudioPause() {
    yield put(audioUpdatePause());

    const scrobblerEnabled = yield select(getScrobblerEnabled);

    if (!scrobblerEnabled) {
        return;
    }

    yield put(scrobblerStop());
}

export function* watchAudioPause() {
    yield throttle(250, PAUSE, handleAudioPause);
}

function* handleAudioPlaying(action: ReturnType<typeof playing>) {
    yield put(audioUpdatePlaying());

    const scrobblerEnabled = yield select(getScrobblerEnabled);

    if (!scrobblerEnabled) {
        return;
    }

    yield put(scrobblerStart());

    try {
        yield call(playingNow, { artist: action.data.performer, track: action.data.title });
    } catch (e) {
        console.error(e);
    }
}

export function* watchAudioPlaying() {
    yield throttle(250, PLAYING, handleAudioPlaying);
}

function* fetchLastfm(action: ReturnType<typeof play>) {
    yield put({ type: FETCH_TRACK_INFO_FROM_LASTFM_REQUEST });
    yield put({ type: FETCH_ARTIST_INFO_FROM_LASTFM_REQUEST });

    try {
        const { artist, track } = yield call(fetchLastFM, { artist: action.data.performer, title: action.data.title });

        yield put({ type: FETCH_TRACK_INFO_FROM_LASTFM_SUCCESS, data: { track } });
        yield put({ type: FETCH_ARTIST_INFO_FROM_LASTFM_SUCCESS, data: { artist } });

        const autoPresets = yield select(getPresetsAuto);

        if (autoPresets) {
            yield put(updateAutoPreset(true));
        }
    } catch {
        yield put({ type: FETCH_TRACK_INFO_FROM_LASTFM_FAILURE });
        yield put({ type: FETCH_ARTIST_INFO_FROM_LASTFM_FAILURE });
    }
}

function* fetchScrobbler(action: ReturnType<typeof play>) {
    const scrobblerEnabled = yield select(getScrobblerEnabled);

    if (!scrobblerEnabled) {
        return;
    }

    yield put(scrobblerNew());
    yield put(scrobblerStart());

    try {
        yield call(playingNow, { artist: action.data.performer, track: action.data.title });
    } catch (e) {
        console.error(e);
    }
}

function* handleAudioPlay(action: ReturnType<typeof play>) {
    yield put(audioUpdatePlay());
    yield put({ type: UPDATE_BASE_FROM_VK, data: { base: action.data } });

    yield fork(fetchScrobbler, action);
    yield fork(fetchLastfm, action);
}

export function* watchAudioPlay() {
    yield throttle(500, PLAY, handleAudioPlay);
}

function* handleAudioTimeupdate(action: ReturnType<typeof timeupdate>) {
    const scrobblerEnabled = yield select(getScrobblerEnabled);

    if (!scrobblerEnabled) {
        return;
    }

    if (action.data.timeupdate > 0) {
        yield put(audioAddPlayedPercent(action.data.timeupdate));
    } else {
        yield put(audioClearPlayedPercent());
    }

    const playedPercent = yield select(getAudioPlayedPercent);

    if (playedPercent > 50) {
        yield put(audioClearPlayedPercent());

        try {
            const result = yield call(scrobble, { artist: action.data.performer, track: action.data.title });

            if (result) {
                yield put(scrobblerStop());
                yield put(scrobblerSuccess());
            }
        } catch {}
    }
}

export function* watchAudioTimeupdate() {
    yield takeLatest(TIMEUPDATE, handleAudioTimeupdate);
}
