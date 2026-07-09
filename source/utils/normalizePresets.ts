import { Preset, PresetList } from '../store/presets/types';
import { presets as defaultPresets } from '../store/presets/reducer';
import { clampToRange, getRandomString } from './js-utils';
export default function normalizePresets(presets: PresetList | Preset[]): PresetList {
    let presetsArray;
    let presetsIds;

    if (Array.isArray(presets)) {
        presetsArray = presets;
        presetsIds = [];
    } else if (typeof presets == 'object') {
        presetsArray = Object.values(presets);
        presetsIds = Object.keys(presets);
    }

    return presetsArray?.reduce((prev, preset: Preset) => {
        let presetId = presetsIds.find(item => presets[item] == preset) || Object.keys(defaultPresets).find(key => {
            return defaultPresets[key]?.name == preset?.name;
        }) || getRandomString(32);

        let { values, name, genres, custom } = preset;
        prev[presetId] = {
            values: values.map(value => clampToRange(+value || 0, [-1, 1])),
            name,
            genres,
            custom
        };
        return prev;
    }, {}) || {};
}