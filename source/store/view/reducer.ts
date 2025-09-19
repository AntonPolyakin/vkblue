import { VIEW__UPDATE } from './constants';

import * as actionCreators from './actionCreators';
import { ViewStore } from './types';
import { InferValueTypes } from '../types';

export type ViewActions = ReturnType<InferValueTypes<typeof actionCreators>>;

const getDefaultState: () => ViewStore = () => ({
    order: ['info', 'equalizer', 'visualizer', 'lyrics'],
    display: true,
});

const defaultState = getDefaultState();

export const view: (state: ViewStore, action: ViewActions) => ViewStore = (state = defaultState, action) => {
    switch (action.type) {
        case VIEW__UPDATE: {
            return { ...state, ...action.data };
        }
        default: {
            return state;
        }
    }
};
