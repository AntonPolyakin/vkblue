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
import { PresetsStore } from './types';
import { InferValueTypes } from '../types';

export type PresetsActions = ReturnType<InferValueTypes<typeof actionCreators>>;

const getDefaultState: () => PresetsStore = () => ({
    presets: [
        {
            name: 'default',
            genres: [],
            values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
            name: 'rock',
            genres: ['rock'],
            values: [0, 0.2, 0.2, 0, -0.2, -0.4, -0.2, 0, 0.2, 0],
        },
        {
            name: 'electronic',
            genres: ['electronic'],
            values: [0.2, 0.2, 0.4, 0.2, 0, -0.2, 0, 0.2, 0.4, 0.2],
        },
        {
            name: 'alternative',
            genres: ['alternative'],
            values: [0.2, 0.2, 0.4, 0, -0.4, -0.4, 0, 0, 0.2, 0.4],
        },
        {
            name: 'jazz',
            genres: ['jazz'],
            values: [0, 0.2, 0.4, 0.2, 0, -0.2, -0.4, 0, 0.2, 0],
        },
        {
            name: 'indie',
            genres: ['indie'],
            values: [-0.2, -0.2, -0.2, -0.2, -0.2, 0, 0.2, 0.4, 0.2, 0],
        },
        {
            name: 'metal',
            genres: ['metal'],
            values: [0, 0, 0.2, 0.2, -0.2, -0.4, -0.2, 0, 0.2, 0],
        },
        {
            name: 'rap',
            genres: ['rap'],
            values: [0, 0.2, 0.4, 0.2, -0.2, -0.4, -0.4, -0.2, 0, 0.2],
        },
        {
            name: 'classic',
            genres: ['classic'],
            values: [0, 0, 0, 0, 0, 0, 0, -0.2, -0.4, -0.4],
        },
        {
            name: 'club',
            genres: ['club'],
            values: [0, 0.2, 0.4, 0.2, 0, 0.2, 0.4, 0.4, 0.2, 0],
        },
        {
            name: 'dance',
            genres: ['dance'],
            values: [0.2, 0.2, 0.4, 0.2, 0, -0.2, -0.2, -0.4, -0.4, 0.4],
        },
        {
            name: 'hip-hop',
            genres: ['hip-hop'],
            values: [0.4, 0.4, 0.4, 0.2, -0.2, 0, 0.2, 0, 0.2, 0.2],
        },
        {
            name: 'pop',
            genres: ['pop'],
            values: [0, 0, 0.2, 0.4, 0.2, 0, 0, 0, -0.2, 0],
        },
        {
            name: 'soft',
            genres: ['soft'],
            values: [0, 0, -0.2, -0.2, 0, 0.2, 0.4, 0.4, 0.6, 0.4],
        },
        {
            name: 'techno',
            genres: ['techno'],
            values: [0.4, 0.4, 0.4, 0.4, 0, -0.2, 0, 0.2, 0.4, 0.4],
        },
        {
            name: 'bass&treble',
            genres: ['bass&treble'],
            values: [0.4, 0.4, 0.6, 0.4, 0, -0.4, -0.2, 0.2, 0.6, 0.4],
        },
        {
            name: 'fullbass',
            genres: ['fullbass'],
            values: [0.4, 0.4, 0.6, 0.4, 0, 0, -0.2, -0.4, -0.4, -0.5],
        },
    ],
    current: 0,
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
            const [defaultPreset, ...restPresets] = state.presets;

            return { ...state, presets: [defaultPreset, action.data, ...restPresets] };
        }
        case PRESETS__UPDATE_PRESETS: {
            return { ...state, presets: action.data };
        }
        case PRESETS__UPDATE_PRESET: {
            const presets = state.presets.map((preset, index) =>
                index === action.data.index ? action.data.preset : preset,
            );

            return { ...state, presets };
        }
        case PRESETS__DELETE_PRESET: {
            const presets = state.presets.filter((preset, index) => index !== action.data);

            return { ...state, presets };
        }
        case PRESETS__UPDATE_CURRENT: {
            return { ...state, current: action.data };
        }
        case PRESETS__UPDATE_AUTO: {
            return { ...state, auto: action.data };
        }
        default: {
            return state;
        }
    }
};
