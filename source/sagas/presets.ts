import { call, put, select, takeEvery } from 'redux-saga/effects';
import { PRESETS_STORAGE_KEY } from '../store/presets/constants';
import { storageGet, storageSet } from '../modules/LocalStorage/storage';
import {
    presetsAddPreset,
    presetsDeletePreset,
    presetsUpdate,
    presetsUpdateAuto,
    presetsUpdateCurrent,
    presetsUpdatePresets,
} from '../store/presets/actionCreators';
import { getPresets, getPresetsPresets, getPresetsCurrentValues } from '../store/presets/selectors';
import trim from 'lodash/trim';
import { getEqualizerFilters } from '../store/equalizer/selectors';
import {
    addPreset,
    deletePreset,
    updateAutoPreset,
    updateCurrentPreset,
    updatePresets,
} from '../actionCreators/presets';
import { equalizerUpdateBiquadFilters } from '../store/equalizer/actionCreators';
import { Preset, PresetsStore } from '../store/presets/types';
import getGenres from '../content/selectors/getGenres';
import {
    ADD_PRESET,
    DELETE_PRESET,
    LOAD_PRESETS,
    UPDATE_AUTO_PRESET,
    UPDATE_CURRENT_PRESET,
    UPDATE_PRESETS,
} from '../constants';

function* handleLoadPresets() {
    const presets: PresetsStore = yield call(storageGet, PRESETS_STORAGE_KEY);
    yield put(presetsUpdate(presets));
}

export function* watchLoadPresets() {
    yield takeEvery(LOAD_PRESETS, handleLoadPresets);
}

function* handleUpdatePresets(action: ReturnType<typeof updatePresets>) {
    yield put(presetsUpdatePresets(action.data));
    const presets: ReturnType<typeof getPresets> = yield select(getPresets);
    yield call(storageSet, PRESETS_STORAGE_KEY, presets);
}

export function* watchUpdatePresets() {
    yield takeEvery(UPDATE_PRESETS, handleUpdatePresets);
}

function* handlePresetsAddPreset(action: ReturnType<typeof addPreset>) {
    const values: ReturnType<typeof getEqualizerFilters> = yield select(getEqualizerFilters);
    const preset: Preset = {
        name: action.data.name,
        genres: action.data.genres
            .split(',')
            .map(trim)
            .filter(g => g),
        values,
        custom: true,
    };

    yield put(presetsAddPreset(preset));
    const presets: ReturnType<typeof getPresets> = yield select(getPresets);
    yield call(storageSet, PRESETS_STORAGE_KEY, presets);
}

export function* watchPresetsAddPreset() {
    yield takeEvery(ADD_PRESET, handlePresetsAddPreset);
}

function* handlePresetsDeletePreset(action: ReturnType<typeof deletePreset>) {
    yield put(presetsUpdateCurrent(0));
    yield put(presetsDeletePreset(action.data));

    const presets: ReturnType<typeof getPresets> = yield select(getPresets);
    const presetsValues: ReturnType<typeof getPresetsCurrentValues> = yield select(getPresetsCurrentValues);

    yield put(equalizerUpdateBiquadFilters(presetsValues));
    yield call(storageSet, PRESETS_STORAGE_KEY, presets);
}

export function* watchPresetsDeletePreset() {
    yield takeEvery(DELETE_PRESET, handlePresetsDeletePreset);
}

function* handlePresetsUpdateCurrent(action: ReturnType<typeof updateCurrentPreset>) {
    yield put(presetsUpdateCurrent(action.data));

    const presetsValues: ReturnType<typeof getPresetsCurrentValues> = yield select(getPresetsCurrentValues);

    yield put(equalizerUpdateBiquadFilters(presetsValues));
    yield put(presetsUpdateAuto(false));

    const newPresets: ReturnType<typeof getPresets> = yield select(getPresets);
    yield call(storageSet, PRESETS_STORAGE_KEY, newPresets);
}

export function* watchPresetsUpdateCurrent() {
    yield takeEvery(UPDATE_CURRENT_PRESET, handlePresetsUpdateCurrent);
}

function* handlePresetsUpdateAuto(action: ReturnType<typeof updateAutoPreset>) {
    if (action.data) {
        const presets: ReturnType<typeof getPresetsPresets> = yield select(getPresetsPresets);
        const genres: string[] = yield select(getGenres);

        const indexPreset = presets
            .findIndex(preset => {
                return genres.some(genre => preset.genres.indexOf(genre.toLowerCase()) !== -1);
            });

        const newPreset = indexPreset > -1 ? indexPreset : 0;
        const newFilters = presets[newPreset].values;

        yield put(presetsUpdateCurrent(newPreset));
        yield put(equalizerUpdateBiquadFilters(newFilters));
    }

    yield put(presetsUpdateAuto(action.data));

    const newPresets: ReturnType<typeof getPresets> = yield select(getPresets);
    yield call(storageSet, PRESETS_STORAGE_KEY, newPresets);
}

export function* watchPresetsUpdateAuto() {
    yield takeEvery(UPDATE_AUTO_PRESET, handlePresetsUpdateAuto);
}
