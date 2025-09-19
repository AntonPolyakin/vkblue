import { getCurrentInfo } from '../modules/getCurrentInfo/content';
import { store } from '../store';
import { getEqualizerSettings } from '../store/settings/selectors';
import { updateAudio, updateEffectGain, updateEffectName, updateSurround } from '../modules/equalizer';
import { getEqualizer, getEqualizerFilters } from '../store/equalizer/selectors';
import getScrobblerEnabled from '../content/selectors/getScrobblerEnabled';
import { equalizerUpdateBiquadFilters } from '../store/equalizer/actionCreators';
import { pause, play, playing, timeupdate } from '../actionCreators/audio';

const { initEqualizer, analyserListeners } = require('../modules/equalizer/index');

window.analyserListeners = analyserListeners;

let firstPlay = true;
let prevSrc = null;
let prevAudio = null;
let prevCurrentTime = 0;

window.addEventListener('message', event => {
    if (typeof event.data !== 'object') {
        return;
    }

    const { data } = event;

    if (data.type === 'CURRENT_AUDIO') {
        const { audioId, eventType } = data;
        const audio = window.document.getElementById(audioId);
        const info = getCurrentInfo();
        const state = store.getState();

        switch (eventType) {
            case 'play': {
                if (firstPlay) {
                    console.log('FIRST_AUDIO_PLAY');
                    if (!audio) {
                        alert('Упс! Похоже какое-то расширение мешает корректной работе VK Blue!');
                    }

                    const equalizerSettings = getEqualizerSettings(state);
                    initEqualizer(audio, equalizerSettings);

                    const equalizer = getEqualizer(state);
                    const filters = getEqualizerFilters(state);

                    store.dispatch(equalizerUpdateBiquadFilters(filters));
                    updateEffectGain(equalizer.convolverGain);
                    updateEffectName(equalizer.convolverEffect);
                    updateSurround(equalizer.surround);

                    firstPlay = false;
                    prevAudio = audio;
                }

                if (prevAudio !== audio) {
                    console.log('NEW_AUDIO_ELEMENT');
                    updateAudio(audio);
                    prevAudio = audio;
                }

                if (prevSrc !== audio.src) {
                    console.log('NEW_AUDIO_SOURCE');
                    store.dispatch(play(info));
                    store.dispatch(timeupdate({ ...info, timeupdate: 0 }));
                    prevSrc = audio.src;
                }
                break;
            }
            case 'playing': {
                store.dispatch(playing(info));
                break;
            }

            case 'pause': {
                store.dispatch(pause(info));
                break;
            }

            case 'timeupdate': {
                if (!getScrobblerEnabled(state)) {
                    return;
                }

                const diff = audio.currentTime - prevCurrentTime;
                prevCurrentTime = audio.currentTime;

                if (diff > 2) {
                    break;
                } else {
                    const time = (100 * diff) / audio.duration;
                    store.dispatch(timeupdate({ ...info, timeupdate: time }));
                }
                break;
            }
        }
    }
});
