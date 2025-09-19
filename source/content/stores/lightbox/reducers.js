import update from 'immutability-helper';

import { OPEN_LIGHT_BOX, CLOSE_LIGHT_BOX } from './action-types';

const defaultState = {
    name: null,
};

const lightbox = (state = defaultState, action) => {
    switch (action.type) {
        case OPEN_LIGHT_BOX: {
            return update(state, { name: { $set: action.data.name } });
        }
        case CLOSE_LIGHT_BOX: {
            return update(state, { name: { $set: null } });
        }
        default:
            return state;
    }
};

export default lightbox;
