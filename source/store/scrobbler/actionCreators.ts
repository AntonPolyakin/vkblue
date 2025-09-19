import {
    SCROBBLER__AUTH_PROCESSING,
    SCROBBLER__NEW,
    SCROBBLER__START,
    SCROBBLER__STOP,
    SCROBBLER__SUCCESS,
    SCROBBLER__UPDATE,
    SCROBBLER__UPDATE_ENABLED,
} from './constants';
import { ScrobblerStore } from './types';

export const scrobblerUpdate = (data: ScrobblerStore) => ({ type: SCROBBLER__UPDATE, data } as const);
export const scrobblerUpdateEnabled = (enabled: boolean) =>
    ({ type: SCROBBLER__UPDATE_ENABLED, data: enabled } as const);
export const scrobblerStart = () => ({ type: SCROBBLER__START } as const);
export const scrobblerStop = () => ({ type: SCROBBLER__STOP } as const);
export const scrobblerNew = () => ({ type: SCROBBLER__NEW } as const);
export const scrobblerAuthProcessing = (auth: boolean) => ({ type: SCROBBLER__AUTH_PROCESSING, data: auth } as const);
export const scrobblerSuccess = () => ({ type: SCROBBLER__SUCCESS } as const);
