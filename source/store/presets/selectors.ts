import { GlobalStore } from '../index';
import { Preset, PresetsStore, PresetValues } from './types';

export const getPresets: (state: GlobalStore) => PresetsStore = ({ presets }) => presets;

export const getPresetsAuto: (state: GlobalStore) => boolean = ({ presets }) => presets.auto;

export const getPresetsPresets: (state: GlobalStore) => Preset[] = ({ presets }) => presets.presets;

export const getPresetsCurrent: (state: GlobalStore) => number = ({ presets }) => presets.current;

export const getPresetsCurrentValues: (state: GlobalStore) => PresetValues = ({ presets }) =>
    presets.presets[presets.current] ? presets.presets[presets.current].values : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
