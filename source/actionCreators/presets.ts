import { Preset, PresetId, PresetList } from '../store/presets/types';
import {
    ADD_PRESET,
    DELETE_PRESET,
    LOAD_PRESETS,
    UPDATE_AUTO_PRESET,
    UPDATE_CURRENT_PRESET,
    UPDATE_PRESET,
    UPDATE_PRESETS,
} from '../constants';

export const loadPresets = () => ({ type: LOAD_PRESETS } as const);
export const updatePresets = (presets: PresetList) => ({ type: UPDATE_PRESETS, data: presets } as const);
export const updatePreset = (preset: Preset, presetId: PresetId) =>
    ({ type: UPDATE_PRESET, data: { preset, presetId } } as const);
export const addPreset = (name: string, genres: string) => ({ type: ADD_PRESET, data: { name, genres } } as const);
export const deletePreset = (presetId: PresetId | PresetId[]) => ({ type: DELETE_PRESET, data: presetId } as const);
export const updateCurrentPreset = (currentId: PresetId | null) => ({ type: UPDATE_CURRENT_PRESET, data: currentId } as const);
export const updateAutoPreset = (auto: boolean) => ({ type: UPDATE_AUTO_PRESET, data: auto } as const);
