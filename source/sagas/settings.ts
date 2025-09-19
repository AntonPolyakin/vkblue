import { call, put, select, takeEvery } from 'redux-saga/effects';
import { SETTINGS_STORAGE_KEY } from '../store/settings/constants';
import { storageGet, storageSet } from '../modules/LocalStorage/storage';
import { reloadAllTabs } from '../modules/reloadAllTabs/content';
import { settingsUpdate } from '../store/settings/actionCreators';
import styles from '../store/settings/styles.scss';
import { getSettings } from '../store/settings/selectors';
import { UPDATE_SETTINGS, LOAD_SETTINGS } from '../constants';
import { updateSettings } from '../actionCreators/settings';

const DISPLAYED_SCROBBLER_CLASS_NAME = styles.scrobblerDisplayed;

function* handleSettingsLoad() {
    const data = yield call(storageGet, SETTINGS_STORAGE_KEY);
    yield put(settingsUpdate(data));

    const newState: ReturnType<typeof getSettings> = yield select(getSettings);

    if (!newState.subscribeToGroup) {
        window.localStorage.stopSubscribe = 'true';
    }

    if (newState.scrobbler) {
        !window.document.documentElement.classList.contains(DISPLAYED_SCROBBLER_CLASS_NAME) &&
            window.document.documentElement.classList.add(DISPLAYED_SCROBBLER_CLASS_NAME);
    } else {
        window.document.documentElement.classList.contains(DISPLAYED_SCROBBLER_CLASS_NAME) &&
            window.document.documentElement.classList.remove(DISPLAYED_SCROBBLER_CLASS_NAME);
    }
}

export function* watchSettingsLoad() {
    yield takeEvery(LOAD_SETTINGS, handleSettingsLoad);
}

function* handleSettingsChange(action: ReturnType<typeof updateSettings>) {
    yield put(settingsUpdate(action.data));

    const newState = yield select(getSettings);
    yield call(storageSet, SETTINGS_STORAGE_KEY, newState);

    yield call(reloadAllTabs);
}

export function* watchSettingsChange() {
    yield takeEvery(UPDATE_SETTINGS, handleSettingsChange);
}
