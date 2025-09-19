import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
    EQUALIZER_STORAGE_KEY,
    EQUALIZER__UPDATE,
    EQUALIZER__UPDATE_BIQUAD_FILTERS,
    EQUALIZER__UPDATE_EFFECT_GAIN,
    EQUALIZER__UPDATE_EFFECT_NAME,
    EQUALIZER__UPDATE_SURROUND,
} from '../store/equalizer/constants';
import { storageGet, storageSet } from '../modules/LocalStorage/storage';
import { equalizerUpdate, equalizerUpdateBiquadFilters } from '../store/equalizer/actionCreators';
import { GlobalStore } from '../store';
import { updateBiquadFilters } from '../actionCreators/equalizer';
import { presetsUpdateAuto, presetsUpdateCurrent } from '../store/presets/actionCreators';
import { PRESETS_STORAGE_KEY } from '../store/presets/constants';
import { LOAD_EQUALIZER, UPDATE_BIQUAD_FILTERS } from '../constants';

function* handleEqualizerLoad() {
    const data = yield call(storageGet, EQUALIZER_STORAGE_KEY);
    yield put(equalizerUpdate(data));
}

export function* watchEqualizerLoad() {
    yield takeEvery(LOAD_EQUALIZER, handleEqualizerLoad);
}

function* handleEqualizerUpdateFilters(action: ReturnType<typeof updateBiquadFilters>) {
    yield put(presetsUpdateAuto(false));
    yield put(equalizerUpdateBiquadFilters(action.data));
    yield put(presetsUpdateCurrent(-1));

    const state: GlobalStore = yield select();
    yield call(storageSet, PRESETS_STORAGE_KEY, state.presets);
}

export function* watchEqualizerUpdateFilters() {
    yield takeEvery(UPDATE_BIQUAD_FILTERS, handleEqualizerUpdateFilters);
}


function* handleEqualizerChange() {
    const state: GlobalStore = yield select();
    yield call(storageSet, EQUALIZER_STORAGE_KEY, state.equalizer);
}

export function* watchEqualizerChange() {
    yield takeLatest(
        [EQUALIZER__UPDATE_BIQUAD_FILTERS, EQUALIZER__UPDATE_EFFECT_NAME, EQUALIZER__UPDATE_EFFECT_GAIN, EQUALIZER__UPDATE_SURROUND, EQUALIZER__UPDATE],
        handleEqualizerChange,
    );
}
