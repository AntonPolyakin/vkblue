import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
    VIEW_STORAGE_KEY,
} from '../store/view/constants';
import { storageGet, storageSet } from '../modules/LocalStorage/storage';
import { viewUpdate } from '../store/view/actionCreators';
import styles from '../store/view/styles.scss';
import { getView } from '../store/view/selectors';
import { LOAD_VIEW, UPDATE_BLOCKS_ORDER, UPDATE_PLAYER_DISPLAY, UPDATE_PLAYLISTS } from '../constants';
import { updateView } from '../actionCreators/view';

const DISPLAYED_BLUE_CLASS_NAME = styles.displayed;

function* handleViewLoad() {
    const data = yield call(storageGet, VIEW_STORAGE_KEY);
    yield put(viewUpdate(data));
}

export function* watchViewLoad() {
    yield takeEvery(LOAD_VIEW, handleViewLoad);
}

function* handleViewChange(action: ReturnType<typeof updateView>) {
    yield put(viewUpdate(action.data));
    const newState = yield select(getView);
    yield call(storageSet, VIEW_STORAGE_KEY, newState);

    if (newState.display) {
        !window.document.documentElement.classList.contains(DISPLAYED_BLUE_CLASS_NAME) &&
            window.document.documentElement.classList.add(DISPLAYED_BLUE_CLASS_NAME);
    } else {
        window.document.documentElement.classList.contains(DISPLAYED_BLUE_CLASS_NAME) &&
            window.document.documentElement.classList.remove(DISPLAYED_BLUE_CLASS_NAME);
    }
}

export function* watchViewChange() {
    yield takeEvery(
        [UPDATE_BLOCKS_ORDER, UPDATE_PLAYER_DISPLAY, UPDATE_PLAYLISTS],
        handleViewChange,
    );
}
