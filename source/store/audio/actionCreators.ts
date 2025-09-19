import {
    AUDIO__ADD_PLAYED_PERCENT,
    AUDIO__CLEAR_PLAYED_PERCENT,
    AUDIO__PAUSE,
    AUDIO__PLAY,
    AUDIO__PLAYING,
} from './constants';

export const audioUpdatePlay = () => ({ type: AUDIO__PLAY } as const);

export const audioUpdatePause = () => ({ type: AUDIO__PAUSE } as const);

export const audioUpdatePlaying = () => ({ type: AUDIO__PLAYING } as const);

export const audioClearPlayedPercent = () => ({ type: AUDIO__CLEAR_PLAYED_PERCENT } as const);

export const audioAddPlayedPercent = (data: number) => ({ type: AUDIO__ADD_PLAYED_PERCENT, data } as const);
