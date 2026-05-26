import {
    PRESETS__ADD_PRESET,
    PRESETS__DELETE_PRESET,
    PRESETS__UPDATE,
    PRESETS__UPDATE_AUTO,
    PRESETS__UPDATE_CURRENT,
    PRESETS__UPDATE_PRESET,
    PRESETS__UPDATE_PRESETS,
} from './constants';

import * as actionCreators from './actionCreators';
import { PresetId, PresetsStore } from './types';
import { InferValueTypes } from '../types';
import { getRandomString, objectFilter } from '../../utils/js-utils';

export type PresetsActions = ReturnType<InferValueTypes<typeof actionCreators>>;

const getDefaultState: () => PresetsStore = () => ({
    presets: {
        'default': {
            name: 'default',
            genres: [],
            values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        'rock': {
            name: 'rock',
            genres: ['rock'],
            values: [0, 0.2, 0.2, 0, -0.2, -0.4, -0.2, 0, 0.2, 0],
        },
        'electronic': {
            name: 'electronic',
            genres: ['electronic'],
            values: [0.2, 0.2, 0.4, 0.2, 0, -0.2, 0, 0.2, 0.4, 0.2],
        },
        'alternative': {
            name: 'alternative',
            genres: ['alternative'],
            values: [0.2, 0.2, 0.4, 0, -0.4, -0.4, 0, 0, 0.2, 0.4],
        },
        'jazz': {
            name: 'jazz',
            genres: ['jazz'],
            values: [0, 0.2, 0.4, 0.2, 0, -0.2, -0.4, 0, 0.2, 0],
        },
        'indie': {
            name: 'indie',
            genres: ['indie'],
            values: [-0.2, -0.2, -0.2, -0.2, -0.2, 0, 0.2, 0.4, 0.2, 0],
        },
        'metal': {
            name: 'metal',
            genres: ['metal'],
            values: [0, 0, 0.2, 0.2, -0.2, -0.4, -0.2, 0, 0.2, 0],
        },
        'rap': {
            name: 'rap',
            genres: ['rap'],
            values: [0, 0.2, 0.4, 0.2, -0.2, -0.4, -0.4, -0.2, 0, 0.2],
        },
        'classic': {
            name: 'classic',
            genres: ['classic'],
            values: [0, 0, 0, 0, 0, 0, 0, -0.2, -0.4, -0.4],
        },
        'club': {
            name: 'club',
            genres: ['club'],
            values: [0, 0.2, 0.4, 0.2, 0, 0.2, 0.4, 0.4, 0.2, 0],
        },
        'dance': {
            name: 'dance',
            genres: ['dance'],
            values: [0.2, 0.2, 0.4, 0.2, 0, -0.2, -0.2, -0.4, -0.4, 0.4],
        },
        'hip-hop': {
            name: 'hip-hop',
            genres: ['hip-hop'],
            values: [0.4, 0.4, 0.4, 0.2, -0.2, 0, 0.2, 0, 0.2, 0.2],
        },
        'pop': {
            name: 'pop',
            genres: ['pop'],
            values: [0, 0, 0.2, 0.4, 0.2, 0, 0, 0, -0.2, 0],
        },
        'soft': {
            name: 'soft',
            genres: ['soft'],
            values: [0, 0, -0.2, -0.2, 0, 0.2, 0.4, 0.4, 0.6, 0.4],
        },
        'techno': {
            name: 'techno',
            genres: ['techno'],
            values: [0.4, 0.4, 0.4, 0.4, 0, -0.2, 0, 0.2, 0.4, 0.4],
        },
        'bassTreble': {
            name: 'bass&treble',
            genres: ['bass&treble'],
            values: [0.4, 0.4, 0.6, 0.4, 0, -0.4, -0.2, 0.2, 0.6, 0.4],
        },
        'fullbass': {
            name: 'fullbass',
            genres: ['fullbass'],
            values: [0.4, 0.4, 0.6, 0.4, 0, 0, -0.2, -0.4, -0.4, -0.5],
        },
    },
    currentId: 'default',
    auto: true,
});

export const presets: (state: PresetsStore, action: PresetsActions) => PresetsStore = (
    state = getDefaultState(),
    action,
) => {
    switch (action.type) {
        case PRESETS__UPDATE: {
            return { ...state, ...action.data };
        }
        case PRESETS__ADD_PRESET: {
            let preset = action.data;
            let presetId: PresetId = getRandomString(32);
            let presets = { ...state.presets, ...{ [presetId]: preset }};
            return { ...state, presets };
        }
        case PRESETS__UPDATE_PRESETS: {
            return { ...state, presets: action.data };
        }
        case PRESETS__UPDATE_PRESET: {
            let { preset, presetId } = action.data;
            let presets = Object.assign({}, state.presets, { [presetId]: Object.assign({}, state.presets[presetId], preset) });
            console.log('presets', presets);
            return { ...state, presets };
        }
        case PRESETS__DELETE_PRESET: {
            let presetIds = Array.isArray(action.data) ? action.data : [action.data];
            let presets = objectFilter(state.presets, (key, value) => {
                return !presetIds.includes(key);
            });
            return { ...state, presets };
        }
        case PRESETS__UPDATE_CURRENT: {
            return { ...state, currentId: action.data };
        }
        case PRESETS__UPDATE_AUTO: {
            return { ...state, auto: action.data };
        }
        default: {
            return state;
        }
    }
};
