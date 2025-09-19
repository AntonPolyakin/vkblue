import { SettingsStore } from '../store/settings/types';
import { UPDATE_SETTINGS, LOAD_SETTINGS } from '../constants';

export const loadSettings = () => ({ type: LOAD_SETTINGS } as const);
export const updateSettings = (data: SettingsStore) =>
    ({
        type: UPDATE_SETTINGS,
        data,
    } as const);
