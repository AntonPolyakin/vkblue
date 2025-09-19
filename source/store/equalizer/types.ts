import { EqualizerConvolverEffectName } from '../../modules/equalizer';

export type ConvolverEffect = EqualizerConvolverEffectName;

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
};

export type FilterValues = [number, number, number, number, number, number, number, number, number, number];
