import { combineReducers } from 'redux';

import { settings } from './settings/reducer';
import data from '../content/stores/data/reducers';
import lightbox from '../content/stores/lightbox/reducers';
import { equalizer } from './equalizer/reducer';
import { audio } from './audio/reducer';
import { view } from './view/reducer';
import { presets } from './presets/reducer';
import { scrobbler } from './scrobbler/reducer';

export const rootReducer = combineReducers({
    settings,
    equalizer,
    audio,
    view,
    presets,
    scrobbler,
    //@ts-ignore
    data,
    //@ts-ignore
    lightbox,
});
