import { call, put, select, takeEvery } from 'redux-saga/effects';
import { storageGet, storageSet } from '../modules/LocalStorage/storage';
import { LOAD_SCROBBLER, SWITCH_SCROBBLER } from '../constants';
import { switchScrobbler } from '../actionCreators/scrobbler';
import { auth } from '../../modules/LastFMScrobbler/content';
import { scrobblerAuthProcessing, scrobblerUpdate, scrobblerUpdateEnabled } from '../store/scrobbler/actionCreators';
import { getScrobblerEnabled } from '../store/scrobbler/selectors';
import { SCROBBLER_STORAGE_KEY } from '../store/scrobbler/constants';

function* handleLoadScrobbler() {
    const data = yield call(storageGet, SCROBBLER_STORAGE_KEY);
    yield put(scrobblerUpdate(data));
}

export function* watchLoadScrobbler() {
    yield takeEvery(LOAD_SCROBBLER, handleLoadScrobbler);
}

function* handleSwitchScrobbler(action: ReturnType<typeof switchScrobbler>) {
    if (action.data) {
        yield put(scrobblerUpdateEnabled(false));
        yield put(scrobblerAuthProcessing(true));


        const token = yield call(auth);

        yield put(scrobblerUpdateEnabled(!!token));
        yield put(scrobblerAuthProcessing(false));
    } else {
        yield put(scrobblerUpdateEnabled(false));
    }

    const enabled = yield select(getScrobblerEnabled);
    yield call(storageSet, SCROBBLER_STORAGE_KEY, { enabled });
}

export function* watchSwitchScrobbler() {
    yield takeEvery(SWITCH_SCROBBLER, handleSwitchScrobbler);
}
