import { ScrobblerStore } from './types';
import {
    SCROBBLER__AUTH_PROCESSING,
    SCROBBLER__NEW,
    SCROBBLER__START,
    SCROBBLER__STOP,
    SCROBBLER__SUCCESS,
    SCROBBLER__UPDATE,
    SCROBBLER__UPDATE_ENABLED,
} from './constants';
import { InferValueTypes } from '../types';
import * as actionCreators from './actionCreators';

export type SettingsActions = ReturnType<InferValueTypes<typeof actionCreators>>;

export const getDefaultScrobbler: () => ScrobblerStore = () => ({
    enabled: false,
    success: false,
    processing: false,
    auth: false,
});

export const scrobbler: (state: ScrobblerStore, action: SettingsActions) => ScrobblerStore = (
    state = getDefaultScrobbler(),
    action,
) => {
    switch (action.type) {
        case SCROBBLER__UPDATE: {
            return { ...state, ...action.data };
        }
        case SCROBBLER__UPDATE_ENABLED: {
            return { ...state, enabled: action.data };
        }
        case SCROBBLER__AUTH_PROCESSING: {
            return { ...state, auth: action.data };
        }
        case SCROBBLER__NEW: {
            return { ...state, success: false };
        }
        case SCROBBLER__SUCCESS: {
            return { ...state, success: true };
        }
        case SCROBBLER__START: {
            return { ...state, processing: true };
        }
        case SCROBBLER__STOP: {
            return { ...state, processing: false };
        }

        default: {
            return state;
        }
    }
};
