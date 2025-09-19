import { EqualizerStore } from './types';
import { EQUALIZER__UPDATE, EQUALIZER__UPDATE_BIQUAD_FILTERS, EQUALIZER__UPDATE_EFFECT_GAIN, EQUALIZER__UPDATE_EFFECT_NAME, EQUALIZER__UPDATE_SURROUND } from './constants';
import { InferValueTypes } from '../types';
import * as actionCreators from './actionCreators';

export type EqualizerActions = ReturnType<InferValueTypes<typeof actionCreators>>;

export const getDefaultEqualizer: () => EqualizerStore = () => ({
    firstBiquadFilter: 0,
    secondBiquadFilter: 0,
    thirdBiquadFilter: 0,
    fourthBiquadFilter: 0,
    fifthBiquadFilter: 0,
    sixthBiquadFilter: 0,
    seventhBiquadFilter: 0,
    eighthBiquadFilter: 0,
    ninthBiquadFilter: 0,
    tenthBiquadFilter: 0,

    convolverEffect: null,
    convolverGain: 0,

    surround: true,
});

export const equalizer: (state: EqualizerStore, action: EqualizerActions) => EqualizerStore = (
    state = getDefaultEqualizer(),
    action,
) => {
    switch (action.type) {
        case EQUALIZER__UPDATE: {
            return { ...state, ...action.data };
        }
        case EQUALIZER__UPDATE_BIQUAD_FILTERS: {
            return {
                ...state,
                firstBiquadFilter: action.data[0],
                secondBiquadFilter: action.data[1],
                thirdBiquadFilter: action.data[2],
                fourthBiquadFilter: action.data[3],
                fifthBiquadFilter: action.data[4],
                sixthBiquadFilter: action.data[5],
                seventhBiquadFilter: action.data[6],
                eighthBiquadFilter: action.data[7],
                ninthBiquadFilter: action.data[8],
                tenthBiquadFilter: action.data[9],
            };
        }
        case EQUALIZER__UPDATE_EFFECT_GAIN: {
            return { ...state, convolverGain: action.data };
        }
        case EQUALIZER__UPDATE_EFFECT_NAME: {
            return { ...state, convolverEffect: action.data };
        }
        case EQUALIZER__UPDATE_SURROUND: {
            return { ...state, surround: action.data };
        }
        default: {
            return state;
        }
    }
};
