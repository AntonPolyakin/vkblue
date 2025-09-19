import { AudioStore } from './types';
import { AUDIO__PAUSE, AUDIO__PLAY, AUDIO__PLAYING, AUDIO__CLEAR_PLAYED_PERCENT, AUDIO__ADD_PLAYED_PERCENT } from './constants';
import { InferValueTypes } from '../types';
import * as actionCreators from './actionCreators';

export type AudioActions = ReturnType<InferValueTypes<typeof actionCreators>>;

export const getDefaultEqualizer: () => AudioStore = () => ({
    paused: true,
    playedPercent: 0,
});

export const audio: (state: AudioStore, action: AudioActions) => AudioStore = (
    state = getDefaultEqualizer(),
    action,
) => {
    switch (action.type) {
        case AUDIO__PLAY: {
            return { ...state, paused: false };
        }
        case AUDIO__PAUSE: {
            return { ...state, paused: true };
        }
        case AUDIO__PLAYING: {
            return { ...state, paused: false };
        }
        case AUDIO__CLEAR_PLAYED_PERCENT: {
            return { ...state, playedPercent: 0 };
        }
        case AUDIO__ADD_PLAYED_PERCENT: {
            return { ...state, playedPercent: state.playedPercent + action.data };
        }
        default: {
            return state;
        }
    }
};
