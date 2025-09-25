import { browser } from 'webextension-polyfill-ts';
import { FFT_SIZE, reduce } from './reduce';

let audioContext: AudioContext;

let mediaElementSource: MediaElementAudioSourceNode;
let mainInputNode: GainNode;

let firstBiquadFilter: BiquadFilterNode;
let secondBiquadFilter: BiquadFilterNode;
let thirdBiquadFilter: BiquadFilterNode;
let fourthBiquadFilter: BiquadFilterNode;
let fifthBiquadFilter: BiquadFilterNode;
let sixthBiquadFilter: BiquadFilterNode;
let seventhBiquadFilter: BiquadFilterNode;
let eighthBiquadFilter: BiquadFilterNode;
let ninthBiquadFilter: BiquadFilterNode;
let tenthBiquadFilter: BiquadFilterNode;

let channelSplitterNode: ChannelSplitterNode;
let channelMergerNode: ChannelMergerNode;
let centerChannelMergerNode: ChannelMergerNode;
let subChannelMergerNode: ChannelMergerNode;
let surroundInputNode: GainNode;
let surroundOutputNode: GainNode;
let defaultChannelCount: number;

let convolverNode: ConvolverNode;
let dryGainNode: GainNode;
let wetGainNode: GainNode;
let convolverOutputNode: GainNode;

let analyserNode: AnalyserNode;
let analyserBuffer: Uint8Array;

let dynamicsCompressorNode: DynamicsCompressorNode;

export const analyserListeners: ((buffer: Float32Array) => Float32Array)[] = [];

type BiquadFilterConfig = {
    frequency: number;
    gain: number;
    type: BiquadFilterType;
    q?: number;
};

export const biquadFilterConfigs: BiquadFilterConfig[] = [
    {
        frequency: 31.5,
        gain: 0,
        type: 'lowshelf',
    },
    {
        frequency: 63,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 125,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 250,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 500,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 1000,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 2000,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 4000,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 8000,
        gain: 0,
        type: 'peaking',
        q: 1.414214,
    },
    {
        frequency: 16000,
        gain: 0,
        type: 'highshelf',
    },
];

const updateBiquadFilter: (
    biquadFilterNode: BiquadFilterNode,
    biquadFilterConfig: BiquadFilterConfig,
) => BiquadFilterNode = (biquadFilterNode, biquadFilterConfig) => {
    biquadFilterNode.frequency.value = biquadFilterConfig.frequency;
    biquadFilterNode.type = biquadFilterConfig.type;

    if (biquadFilterConfig.q) {
        biquadFilterNode.Q.value = biquadFilterConfig.q;
    }

    return biquadFilterNode;
};

export type EqualizerSettings = {
    equalizer: boolean;
    equalizerSurround: boolean;
    equalizerEffects: boolean;
    equalizerAnalyser: boolean;
    equalizerCompressor: boolean;
    equalizerCompressorThreshold: number;
    equalizerCompressorKnee: number;
    equalizerCompressorRatio: number;
    equalizerCompressorAttack: number;
    equalizerCompressorRelease: number;
};

export const initEqualizer = (audio: HTMLAudioElement, config: EqualizerSettings) => {
    console.log('INIT_EQUALIZER', config, audio);
    if (!config.equalizer) {
        return;
    }

    let lastNode: AudioNode;

    audioContext = new AudioContext();
    mainInputNode = audioContext.createGain();

    updateAudio(audio);

    lastNode = mainInputNode;

    firstBiquadFilter = audioContext.createBiquadFilter();
    secondBiquadFilter = audioContext.createBiquadFilter();
    thirdBiquadFilter = audioContext.createBiquadFilter();
    fourthBiquadFilter = audioContext.createBiquadFilter();
    fifthBiquadFilter = audioContext.createBiquadFilter();
    sixthBiquadFilter = audioContext.createBiquadFilter();
    seventhBiquadFilter = audioContext.createBiquadFilter();
    eighthBiquadFilter = audioContext.createBiquadFilter();
    ninthBiquadFilter = audioContext.createBiquadFilter();
    tenthBiquadFilter = audioContext.createBiquadFilter();

    updateBiquadFilter(firstBiquadFilter, biquadFilterConfigs[0]);
    updateBiquadFilter(secondBiquadFilter, biquadFilterConfigs[1]);
    updateBiquadFilter(thirdBiquadFilter, biquadFilterConfigs[2]);
    updateBiquadFilter(fourthBiquadFilter, biquadFilterConfigs[3]);
    updateBiquadFilter(fifthBiquadFilter, biquadFilterConfigs[4]);
    updateBiquadFilter(sixthBiquadFilter, biquadFilterConfigs[5]);
    updateBiquadFilter(seventhBiquadFilter, biquadFilterConfigs[6]);
    updateBiquadFilter(eighthBiquadFilter, biquadFilterConfigs[7]);
    updateBiquadFilter(ninthBiquadFilter, biquadFilterConfigs[8]);
    updateBiquadFilter(tenthBiquadFilter, biquadFilterConfigs[9]);

    firstBiquadFilter.connect(secondBiquadFilter);
    secondBiquadFilter.connect(thirdBiquadFilter);
    thirdBiquadFilter.connect(fourthBiquadFilter);
    fourthBiquadFilter.connect(fifthBiquadFilter);
    fifthBiquadFilter.connect(sixthBiquadFilter);
    sixthBiquadFilter.connect(seventhBiquadFilter);
    seventhBiquadFilter.connect(eighthBiquadFilter);
    eighthBiquadFilter.connect(ninthBiquadFilter);
    ninthBiquadFilter.connect(tenthBiquadFilter);

    lastNode.connect(firstBiquadFilter);
    lastNode = tenthBiquadFilter;

    if (config.equalizerSurround) {
        defaultChannelCount = audioContext.destination.channelCount;

        switch (audioContext.destination.maxChannelCount) {
            case 4:
            case 6:
            case 8: {
                channelSplitterNode = audioContext.createChannelSplitter(2);
                channelMergerNode = audioContext.createChannelMerger(8);
                centerChannelMergerNode = audioContext.createChannelMerger(1);
                subChannelMergerNode = audioContext.createChannelMerger(1);

                channelSplitterNode.connect(centerChannelMergerNode, 0, 0);
                channelSplitterNode.connect(centerChannelMergerNode, 1, 0);

                channelSplitterNode.connect(subChannelMergerNode, 0, 0);
                channelSplitterNode.connect(subChannelMergerNode, 1, 0);

                channelSplitterNode.connect(channelMergerNode, 0, 0);
                channelSplitterNode.connect(channelMergerNode, 1, 1);
                centerChannelMergerNode.connect(channelMergerNode, 0, 2);
                subChannelMergerNode.connect(channelMergerNode, 0, 3);

                channelSplitterNode.connect(channelMergerNode, 0, 4);
                channelSplitterNode.connect(channelMergerNode, 1, 5);

                channelSplitterNode.connect(channelMergerNode, 0, 6);
                channelSplitterNode.connect(channelMergerNode, 1, 7);
                break;
            }

            default: {
                channelSplitterNode = audioContext.createChannelSplitter(2);
                channelMergerNode = audioContext.createChannelMerger(6);
                centerChannelMergerNode = audioContext.createChannelMerger(1);

                channelSplitterNode.connect(centerChannelMergerNode, 0, 0);
                channelSplitterNode.connect(centerChannelMergerNode, 1, 0);

                const fixedCenter = audioContext.createGain();
                fixedCenter.gain.value = 0.2;
                centerChannelMergerNode.connect(fixedCenter, 0);

                channelSplitterNode.connect(channelMergerNode, 0, 0);
                channelSplitterNode.connect(channelMergerNode, 1, 1);
                fixedCenter.connect(channelMergerNode, 0, 2);

                break;
            }
        }

        surroundInputNode = audioContext.createGain();
        surroundOutputNode = audioContext.createGain();

        lastNode.connect(surroundInputNode);
        surroundInputNode.connect(channelSplitterNode);
        channelMergerNode.connect(surroundOutputNode);

        lastNode = surroundOutputNode;
    }

    if (config.equalizerEffects) {
        convolverNode = audioContext.createConvolver();

        convolverOutputNode = audioContext.createGain();
        dryGainNode = audioContext.createGain();
        wetGainNode = audioContext.createGain();

        wetGainNode.gain.value = 0.5;

        lastNode.connect(dryGainNode);
        lastNode.connect(convolverNode);

        convolverNode.connect(wetGainNode);

        dryGainNode.connect(convolverOutputNode);
        wetGainNode.connect(convolverOutputNode);

        lastNode = convolverOutputNode;
    }

    if (config.equalizerAnalyser) {
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = FFT_SIZE;

        analyserBuffer = new Uint8Array(analyserNode.frequencyBinCount);

        let smoothFrequencies: Uint8Array = new Uint8Array();
        let smoothStep = 0;

        const sendFrequencies = () => {
            if (analyserListeners.length) {
                if (!mediaElementSource.mediaElement.paused) {
                    analyserNode.getByteFrequencyData(analyserBuffer as Uint8Array<ArrayBuffer>);

                    smoothFrequencies = analyserBuffer;
                    smoothStep = 256;
                    const frequencies = reduce(analyserBuffer);

                    for (let i = 0, length = analyserListeners.length; i < length; i++) {
                        if (typeof analyserListeners[i] === 'function') {
                            setTimeout(analyserListeners[i], 0, frequencies);
                        }
                    }
                } else if (mediaElementSource.mediaElement.paused && smoothStep > 0) {
                    for (let index = 0, length = analyserNode.fftSize; index < length; index++) {
                        const newValue = smoothFrequencies[index] - 1;

                        smoothFrequencies[index] = newValue < 0 ? 0 : newValue;
                    }
                    smoothStep--;
                    const frequencies = reduce(smoothFrequencies);

                    for (let i = 0, length = analyserListeners.length; i < length; i++) {
                        if (typeof analyserListeners[i] === 'function') {
                            setTimeout(analyserListeners[i], 0, frequencies);
                        }
                    }
                }
            }

            window.requestAnimationFrame(sendFrequencies);
        };

        window.requestAnimationFrame(sendFrequencies);

        lastNode.connect(analyserNode);

        lastNode = analyserNode;
    }

    if (config.equalizerCompressor) {
        dynamicsCompressorNode = audioContext.createDynamicsCompressor();
        dynamicsCompressorNode.threshold.setValueAtTime(config.equalizerCompressorThreshold, audioContext.currentTime);
        dynamicsCompressorNode.knee.setValueAtTime(config.equalizerCompressorKnee, audioContext.currentTime);
        dynamicsCompressorNode.ratio.setValueAtTime(config.equalizerCompressorRatio, audioContext.currentTime);
        dynamicsCompressorNode.attack.setValueAtTime(config.equalizerCompressorAttack, audioContext.currentTime);
        dynamicsCompressorNode.release.setValueAtTime(config.equalizerCompressorRelease, audioContext.currentTime);

        lastNode.connect(dynamicsCompressorNode);

        lastNode = dynamicsCompressorNode;
    }

    window.document.documentElement.addEventListener('click', () => {
        if (audioContext.state !== 'running') {
            audioContext.resume();
        }
    });

    lastNode.connect(audioContext.destination);
};

export const MAX_BIQUAD_FILTER_VALUE: number = 10;
export const MIN_BIQUAD_FILTER_VALUE: number = 10;

export const updateFilters = (
    first: number,
    second: number,
    third: number,
    fourth: number,
    fifth: number,
    sixth: number,
    seventh: number,
    eighth: number,
    ninth: number,
    tenth: number,
) => {
    if (!audioContext) {
        return;
    }

    console.log('EQUALIZER_UPDATE_FILTERS', [
        first,
        second,
        third,
        fourth,
        fifth,
        sixth,
        seventh,
        eighth,
        ninth,
        tenth,
    ]);

    firstBiquadFilter.gain.value = Math.round(first * MAX_BIQUAD_FILTER_VALUE);
    secondBiquadFilter.gain.value = Math.round(second * MAX_BIQUAD_FILTER_VALUE);
    thirdBiquadFilter.gain.value = Math.round(third * MAX_BIQUAD_FILTER_VALUE);
    fourthBiquadFilter.gain.value = Math.round(fourth * MAX_BIQUAD_FILTER_VALUE);
    fifthBiquadFilter.gain.value = Math.round(fifth * MAX_BIQUAD_FILTER_VALUE);
    sixthBiquadFilter.gain.value = Math.round(sixth * MAX_BIQUAD_FILTER_VALUE);
    seventhBiquadFilter.gain.value = Math.round(seventh * MAX_BIQUAD_FILTER_VALUE);
    eighthBiquadFilter.gain.value = Math.round(eighth * MAX_BIQUAD_FILTER_VALUE);
    ninthBiquadFilter.gain.value = Math.round(ninth * MAX_BIQUAD_FILTER_VALUE);
    tenthBiquadFilter.gain.value = Math.round(tenth * MAX_BIQUAD_FILTER_VALUE);
};

export const updateSurround = (enabled: boolean) => {
    if (!channelSplitterNode) {
        return;
    }

    console.log('EQUALIZER_UPDATE_SURROUND', enabled);

    if (enabled) {
        audioContext.destination.channelCount = audioContext.destination.maxChannelCount;
        console.log('EQUALIZER_SURROUND_CHANEL_COUNT', audioContext.destination.channelCount);
        surroundInputNode.disconnect();
        channelMergerNode.disconnect();

        surroundInputNode.connect(channelSplitterNode);
        channelMergerNode.connect(surroundOutputNode);
    } else {
        audioContext.destination.channelCount = defaultChannelCount;
        surroundInputNode.disconnect();
        channelMergerNode.disconnect();

        surroundInputNode.connect(surroundOutputNode);
    }
};

let mediaIsConnected: boolean = false;

const handleEmptied = () => {
    console.log('EQUALIZER_AUDIO_SOURCE_DISCONNECT_ON_EMPTIED');
    mediaElementSource.disconnect();
    mediaIsConnected = false;
};
const handlePlaying = () => {
    if (!mediaIsConnected) {
        console.log('EQUALIZER_AUDIO_SOURCE_RECONNECT_ON_PLAYING');
        mediaElementSource.connect(mainInputNode);
        mediaIsConnected = true;
    }
};

export const updateAudio = (audio: HTMLAudioElement) => {
    if (!audioContext) {
        return;
    }

    console.log('EQUALIZER_UPDATE_AUDIO', audio);

    if (mediaElementSource) {
        mediaElementSource.mediaElement.removeEventListener('playing', handlePlaying);
        mediaElementSource.mediaElement.removeEventListener('emptied', handleEmptied);
        mediaElementSource.disconnect();
        mediaIsConnected = false;
    }

    mediaElementSource = audioContext.createMediaElementSource(audio);
    mediaElementSource.connect(mainInputNode);
    mediaIsConnected = true;

    mediaElementSource.mediaElement.addEventListener('playing', handlePlaying);
    mediaElementSource.mediaElement.addEventListener('emptied', handleEmptied);
};

export type EqualizerConvolverEffectName = 'ambience' | 'plate' | 'hall' | 'space' | null;

const convolverCache: Map<string, AudioBuffer> = new Map();

export const updateEffectName = (effect: EqualizerConvolverEffectName) => {
    if (!convolverNode) {
        return;
    }
    console.log('EQUALIZER_UPDATE_EFFECT_NAME', effect);

    if (convolverCache.has(effect)) {
        convolverNode.buffer = convolverCache.get(effect);
        return;
    }

    if (!effect) {
        convolverNode.buffer = null;
        return;
    }

    const request = new XMLHttpRequest();
    const sound = browser.extension.getURL(`sounds/${effect}.wav`);
    request.open('GET', sound, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
        audioContext.decodeAudioData(request.response, audioBuffer => {
            convolverCache.set(effect, audioBuffer);
            convolverNode.buffer = audioBuffer;
        });
    };
    request.send();
};

export const updateEffectGain = (gain: number) => {
    if (!wetGainNode) {
        return;
    }

    console.log('EQUALIZER_UPDATE_EFFECT_GAIN', gain);

    wetGainNode.gain.value = gain;
};
