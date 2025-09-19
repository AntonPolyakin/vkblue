import { LASTFM_AUTH, LASTFM_SCROBBLE, LASTFM_PLAYING_NOW } from './action-types';
import { send } from '../../source/modules/Port/content';

export const auth = () => send(LASTFM_AUTH);

export const scrobble = data => send(LASTFM_SCROBBLE, data);

export const playingNow = data => send(LASTFM_PLAYING_NOW, data);
