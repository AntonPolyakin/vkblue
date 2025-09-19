import { SettingsStore } from './types';
import { EqualizerSettings } from '../../modules/equalizer';
import { GlobalStore } from '../index';

export const getEqualizerSettings: (state: GlobalStore) => EqualizerSettings = ({ settings }) => ({
    equalizer: settings.equalizer,
    equalizerAnalyser: settings.equalizerAnalyser,
    equalizerSurround: settings.equalizerSurround,
    equalizerEffects: settings.equalizerEffects,
    equalizerCompressor: settings.equalizerCompressor,
    equalizerCompressorThreshold: settings.equalizerCompressorThreshold,
    equalizerCompressorKnee: settings.equalizerCompressorKnee,
    equalizerCompressorRatio: settings.equalizerCompressorRatio,
    equalizerCompressorAttack: settings.equalizerCompressorAttack,
    equalizerCompressorRelease: settings.equalizerCompressorRelease,
});

export const getSettings: (state: GlobalStore) => SettingsStore = ({ settings }) => settings;

export const getSettingsEqualizerEnabled: (state: GlobalStore) => boolean = ({ settings }) => settings.equalizer;

export const getSettingsAnalyzerEnabled: (state: GlobalStore) => boolean = ({ settings }) =>
    settings.equalizer && settings.equalizerAnalyser;

export const getSettingsScrobblerEnabled: (state: GlobalStore) => boolean = ({ settings }) => settings.scrobbler;

export const getSettingsSurroundEnabled: (state: GlobalStore) => boolean = ({ settings }) => settings.equalizerSurround;

export const getSettingsCompressorEnabled: (state: GlobalStore) => boolean = ({ settings }) => settings.equalizerCompressor;
