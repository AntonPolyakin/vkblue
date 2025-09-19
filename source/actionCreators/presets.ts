import { Preset } from '../store/presets/types';
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
export const updatePresets = (presets: Preset[]) => ({ type: UPDATE_PRESETS, data: presets } as const);
export const presetsUpdatePreset = (preset: Preset, index: number) =>
    ({ type: UPDATE_PRESET, data: { preset, index } } as const);
export const addPreset = (name: string, genres: string) => ({ type: ADD_PRESET, data: { name, genres } } as const);
export const deletePreset = (index: number) => ({ type: DELETE_PRESET, data: index } as const);
export const updateCurrentPreset = (current: number) => ({ type: UPDATE_CURRENT_PRESET, data: current } as const);
export const updateAutoPreset = (auto: boolean) => ({ type: UPDATE_AUTO_PRESET, data: auto } as const);
