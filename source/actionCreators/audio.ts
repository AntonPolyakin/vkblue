import { PLAY} from '../store/audio/constants';
import { PAUSE, PLAYING, TIMEUPDATE } from '../constants';

export const play = (data: any) => ({ type: PLAY, data } as const);
export const pause = () => ({ type: PAUSE } as const);
export const playing = (data: any) => ({ type: PLAYING, data } as const);
export const timeupdate = (data: any) => ({ type: TIMEUPDATE, data } as const);
