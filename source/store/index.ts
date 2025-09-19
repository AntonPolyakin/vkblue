import { applyMiddleware, createStore, Middleware, Store } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

import { rootReducer } from './rootReducer';
import { rootSaga } from './rootSaga';
import { SettingsStore } from './settings/types';
import { EqualizerStore } from './equalizer/types';
import { AudioStore } from './audio/types';
import { ViewStore } from './view/types';
import { PresetsStore } from './presets/types';
import { loadPresets } from '../actionCreators/presets';
import { loadSettings } from '../actionCreators/settings';
import { loadView } from '../actionCreators/view';
import { loadEqualizer } from '../actionCreators/equalizer';
import { ScrobblerStore } from './scrobbler/types';
import { loadScrobbler } from '../actionCreators/scrobbler';

const sagaMiddleware = createSagaMiddleware();

export interface GlobalStore {
    settings: SettingsStore;
    equalizer: EqualizerStore;
    audio: AudioStore;
    view: ViewStore;
    presets: PresetsStore;
    scrobbler: ScrobblerStore;
}

const middleware: Middleware[] = [sagaMiddleware, thunk];

if (process.env.NODE_ENV !== 'production') {
    //@ts-ignore
    const logger = createLogger({ collapsed: true });

    middleware.push(logger);
}

export const store: Store<GlobalStore> = createStore(rootReducer, applyMiddleware(...middleware));

sagaMiddleware.run(rootSaga);

store.dispatch(loadSettings());
store.dispatch(loadEqualizer());
store.dispatch(loadView());
store.dispatch(loadPresets());
store.dispatch(loadScrobbler());
