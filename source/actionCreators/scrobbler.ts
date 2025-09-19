import { LOAD_SCROBBLER, SWITCH_SCROBBLER } from '../constants';

export const loadScrobbler = () => ({ type: LOAD_SCROBBLER } as const);

export const switchScrobbler = (enabled: boolean) => ({ type: SWITCH_SCROBBLER, data: enabled } as const);
