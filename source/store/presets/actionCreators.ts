import { Preset, PresetsStore } from './types';
import {
    PRESETS__ADD_PRESET,
    PRESETS__DELETE_PRESET,
    PRESETS__UPDATE,
    PRESETS__UPDATE_AUTO,
    PRESETS__UPDATE_CURRENT,
    PRESETS__UPDATE_PRESET,
    PRESETS__UPDATE_PRESETS,
} from './constants';

export const presetsUpdate = (presets: PresetsStore) => ({ type: PRESETS__UPDATE, data: presets } as const);
export const presetsUpdatePresets = (presets: Preset[]) => ({ type: PRESETS__UPDATE_PRESETS, data: presets } as const);
export const presetsUpdatePreset = (preset: Preset, index: number) =>
    ({ type: PRESETS__UPDATE_PRESET, data: { preset, index } } as const);
export const presetsAddPreset = (preset: Preset) => ({ type: PRESETS__ADD_PRESET, data: preset } as const);
export const presetsDeletePreset = (index: number) => ({ type: PRESETS__DELETE_PRESET, data: index } as const);
export const presetsUpdateCurrent = (current: number) => ({ type: PRESETS__UPDATE_CURRENT, data: current } as const);
export const presetsUpdateAuto = (auto: boolean) => ({ type: PRESETS__UPDATE_AUTO, data: auto } as const);
