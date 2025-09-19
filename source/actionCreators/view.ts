import { ViewStore } from '../store/view/types';
import { LOAD_VIEW, UPDATE_PLAYER_DISPLAY, UPDATE_VIEW } from '../constants';

export const loadView = () => ({ type: LOAD_VIEW } as const);
export const updateView = (data: Partial<ViewStore>) =>
    ({
        type: UPDATE_VIEW,
        data,
    } as const);
export const updatePlayerDisplay = (display: boolean) => ({ type: UPDATE_PLAYER_DISPLAY, data: { display } } as const);
