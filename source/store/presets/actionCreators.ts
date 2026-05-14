import { Preset, PresetId, PresetList, PresetsStore } from './types';
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
export const presetsUpdatePresets = (presets: PresetList) => ({ type: PRESETS__UPDATE_PRESETS, data: presets } as const);
export const presetsUpdatePreset = (preset: Preset, presetId: PresetId) =>
    ({ type: PRESETS__UPDATE_PRESET, data: { preset, presetId } } as const);
export const presetsAddPreset = (preset: Preset) => ({ type: PRESETS__ADD_PRESET, data: preset } as const);
export const presetsDeletePreset = (presetId: PresetId|PresetId[]) => ({ type: PRESETS__DELETE_PRESET, data: presetId } as const);
export const presetsUpdateCurrent = (currentId: PresetId | null) => ({ type: PRESETS__UPDATE_CURRENT, data: currentId } as const);
export const presetsUpdateAuto = (auto: boolean) => ({ type: PRESETS__UPDATE_AUTO, data: auto } as const);
