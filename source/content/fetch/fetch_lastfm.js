import { getLastFMInfo } from '../../../modules/LastFMInfo/content';

export default async function({ artist, title }) {
    if (!artist || !title) {
        return Promise.reject(null);
    }

    return getLastFMInfo({ artist, title });
}
