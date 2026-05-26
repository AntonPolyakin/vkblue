export type PresetValues = [number, number, number, number, number, number, number, number, number, number];

export type Preset = {
    name: string;
    genres: string[];
    values: PresetValues;
    custom?: boolean;
};

export type PresetId = string;

export type PresetList = {
    [presetId: PresetId]: Preset
};

export type PresetsStore = {
    presets: PresetList;
    currentId: PresetId | null;
    auto: boolean;
};
