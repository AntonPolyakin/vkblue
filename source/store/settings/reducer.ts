import { SettingsStore } from './types';
import { SETTINGS__UPDATE } from './constants';
import { InferValueTypes } from '../types';
import * as actionCreators from './actionCreators';

export type SettingsActions = ReturnType<InferValueTypes<typeof actionCreators>>;

export const getDefaultSettings: () => SettingsStore = () => ({
    equalizer: true,
    equalizerSurround: false,
    equalizerEffects: true,
    equalizerAnalyser: true,
    equalizerCompressor: true,
    scrobbler: true,
    equalizerCompressorThreshold: -50,
    equalizerCompressorKnee: 40,
    equalizerCompressorRatio: 12,
    equalizerCompressorAttack: 0,
    equalizerCompressorRelease: 0.25,
    subscribeToGroup: true,
});

export const settings: (state: SettingsStore, action: SettingsActions) => SettingsStore = (
    state = getDefaultSettings(),
    action,
) => {
    switch (action.type) {
        case SETTINGS__UPDATE: {
            return { ...state, ...action.data };
        }
        default: {
            return state;
        }
    }
};
