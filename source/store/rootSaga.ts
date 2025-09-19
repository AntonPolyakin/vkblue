import { all } from 'redux-saga/effects';
import { watchSettingsChange, watchSettingsLoad } from '../sagas/settings';
import { watchEqualizerChange, watchEqualizerLoad, watchEqualizerUpdateFilters } from '../sagas/equalizer';
import { watchAudioPause, watchAudioPlay, watchAudioPlaying, watchAudioTimeupdate } from '../sagas/audio';
import { watchViewChange, watchViewLoad } from '../sagas/view';
import {
    watchPresetsAddPreset,
    watchPresetsDeletePreset,
    watchLoadPresets,
    watchPresetsUpdateAuto,
    watchPresetsUpdateCurrent,
    watchUpdatePresets,
} from '../sagas/presets';
import { watchLoadScrobbler, watchSwitchScrobbler } from '../sagas/scrobbler';

export function* rootSaga() {
    yield all([
        watchSettingsChange(),
        watchSettingsLoad(),
        watchViewChange(),
        watchViewLoad(),
        watchEqualizerChange(),
        watchEqualizerLoad(),
        watchAudioPlay(),
        watchAudioPause(),
        watchAudioPlaying(),
        watchAudioTimeupdate(),
        watchLoadPresets(),
        watchPresetsUpdateAuto(),
        watchPresetsUpdateCurrent(),
        watchPresetsDeletePreset(),
        watchPresetsAddPreset(),
        watchUpdatePresets(),
        watchEqualizerUpdateFilters(),
        watchSwitchScrobbler(),
        watchLoadScrobbler(),
    ]);
}
