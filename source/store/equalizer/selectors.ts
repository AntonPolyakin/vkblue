import { ConvolverEffect, EqualizerStore, FilterValues } from './types';
import { GlobalStore } from '../index';

export const getEqualizer: (state: GlobalStore) => EqualizerStore = ({ equalizer }) => equalizer;

export const getEqualizerFilters: (
    state: GlobalStore,
) => FilterValues = ({ equalizer }) => [
    equalizer.firstBiquadFilter,
    equalizer.secondBiquadFilter,
    equalizer.thirdBiquadFilter,
    equalizer.fourthBiquadFilter,
    equalizer.fifthBiquadFilter,
    equalizer.sixthBiquadFilter,
    equalizer.seventhBiquadFilter,
    equalizer.eighthBiquadFilter,
    equalizer.ninthBiquadFilter,
    equalizer.tenthBiquadFilter,
];

export const getEqualizerSurround: (state: GlobalStore) => boolean = ({ equalizer }) => equalizer.surround;

export const getEqualizerConvolverEffect: (state: GlobalStore) => ConvolverEffect = ({ equalizer }) =>
    equalizer.convolverEffect;

export const getEqualizerConvolverGain: (state: GlobalStore) => number = ({ equalizer }) => equalizer.convolverGain;
