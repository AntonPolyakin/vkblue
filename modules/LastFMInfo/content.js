import { LASTFM_GET_INFO } from './action-types';
import { send } from '../../source/modules/Port/content';

export const getLastFMInfo = ({ artist, title }) => {
    send('TICK_ANALYTIC');
    return send(LASTFM_GET_INFO, { artist, title });
};
