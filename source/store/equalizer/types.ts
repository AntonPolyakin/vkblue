import { EqualizerConvolverEffectName } from '../../modules/equalizer';

export type ConvolverEffect = EqualizerConvolverEffectName;

export type PitchSettings = {
    pitchValueSemitones: number;
    pitchValueCents: number;
    windowSizeMilliseconds: number;
    applySmartProcessing: boolean;
    speedUnits: number;
    speedFine: number;
    preservePitch: boolean;
};

export type EqualizerStore = {
    firstBiquadFilter: number;
    secondBiquadFilter: number;
    thirdBiquadFilter: number;
    fourthBiquadFilter: number;
    fifthBiquadFilter: number;
    sixthBiquadFilter: number;
    seventhBiquadFilter: number;
    eighthBiquadFilter: number;
    ninthBiquadFilter: number;
    tenthBiquadFilter: number;

    convolverEffect: ConvolverEffect;
    convolverGain: number;

    surround: boolean;
} & PitchSettings;

export type FilterValues = [number, number, number, number, number, number, number, number, number, number];
