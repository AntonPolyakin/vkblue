import update from 'immutability-helper';

import { LOAD_STORE_FROM_STORAGE } from '../../constants';
import {
    FETCH_ARTIST_INFO_FROM_LASTFM_FAILURE,
    FETCH_ARTIST_INFO_FROM_LASTFM_REQUEST,
    FETCH_ARTIST_INFO_FROM_LASTFM_SUCCESS,
    FETCH_TRACK_INFO_FROM_LASTFM_FAILURE,
    FETCH_TRACK_INFO_FROM_LASTFM_REQUEST,
    FETCH_TRACK_INFO_FROM_LASTFM_SUCCESS,
    UPDATE_BASE_FROM_VK,
} from './action-types';

const getDefaultState = () => ({
    lastfm: {
        track: undefined,
        artist: undefined,
    },
    vk: {
        base: undefined,
    },
});

const defaultState = getDefaultState();

const audio = (state = defaultState, action) => {
    const reducers = {
        [LOAD_STORE_FROM_STORAGE]: () => {
            return action.data.data || state;
        },
        [FETCH_ARTIST_INFO_FROM_LASTFM_REQUEST]: () => {
            return update(state, { lastfm: { artist: { $set: undefined } } });
        },
        [FETCH_ARTIST_INFO_FROM_LASTFM_SUCCESS]: () => {
            return update(state, { lastfm: { artist: { $set: action.data.artist } } });
        },
        [FETCH_ARTIST_INFO_FROM_LASTFM_FAILURE]: () => {
            return update(state, { lastfm: { artist: { $set: new Error('error') } } });
        },
        [FETCH_TRACK_INFO_FROM_LASTFM_REQUEST]: () => {
            return update(state, { lastfm: { track: { $set: undefined } } });
        },
        [FETCH_TRACK_INFO_FROM_LASTFM_SUCCESS]: () => {
            return update(state, { lastfm: { track: { $set: action.data.track } } });
        },
        [FETCH_TRACK_INFO_FROM_LASTFM_FAILURE]: () => {
            return update(state, { lastfm: { track: { $set: new Error('error') } } });
        },
        [UPDATE_BASE_FROM_VK]: () => {
            return update(state, { vk: { base: { $set: action.data.base } } });
        },
    };

    if (typeof reducers[action.type] === 'function') {
        return reducers[action.type]();
    } else {
        return state;
    }
};

export default audio;
