export type PresetValues = [number, number, number, number, number, number, number, number, number, number];

export type Preset = {
    name: string;
    genres: string[];
    values: PresetValues;
    custom?: boolean;
};

export type PresetsStore = {
    presets: Preset[];
    current: number;
    auto: boolean;
};
