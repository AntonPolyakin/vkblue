import { GlobalStore } from '../index';
import { PresetList, PresetsStore, PresetValues } from './types';

export const getPresets: (state: GlobalStore) => PresetsStore = ({ presets }) => presets;

export const getPresetsAuto: (state: GlobalStore) => boolean = ({ presets }) => presets.auto;

export const getPresetsPresets: (state: GlobalStore) => PresetList = ({ presets }) => presets.presets;

export const getPresetsCurrent: (state: GlobalStore) => string | null = ({ presets }) => presets.currentId;

export const getPresetsCurrentValues: (state: GlobalStore) => PresetValues = ({ presets }) => {
    let currentId = presets.currentId as string;
    return presets.presets?.[currentId] ? presets.presets[currentId].values : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}
    
