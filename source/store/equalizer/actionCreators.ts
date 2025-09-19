import { ConvolverEffect, EqualizerStore, FilterValues } from './types';
import {
    EQUALIZER__UPDATE,
    EQUALIZER__UPDATE_BIQUAD_FILTERS,
    EQUALIZER__UPDATE_EFFECT_GAIN,
    EQUALIZER__UPDATE_EFFECT_NAME,
    EQUALIZER__UPDATE_SURROUND,
} from './constants';
import { updateEffectGain, updateEffectName, updateFilters, updateSurround } from '../../modules/equalizer';

export const equalizerUpdateEffectName = (data: ConvolverEffect) => {
    updateEffectName(data);

    return {
        type: EQUALIZER__UPDATE_EFFECT_NAME,
        data,
    } as const;
};

export const equalizerUpdateEffectGain = (data: number) => {
    updateEffectGain(data);

    return {
        type: EQUALIZER__UPDATE_EFFECT_GAIN,
        data,
    } as const;
};

export const equalizerUpdateSurround = (data: boolean) => {
    updateSurround(data);

    return {
        type: EQUALIZER__UPDATE_SURROUND,
        data,
    } as const;
};

export const equalizerUpdateBiquadFilters = (
    data: FilterValues,
) => {
    updateFilters(...data);

    return {
        type: EQUALIZER__UPDATE_BIQUAD_FILTERS,
        data,
    } as const;
};

export const equalizerUpdate = (data: EqualizerStore) => ({ type: EQUALIZER__UPDATE, data } as const);
