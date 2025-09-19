import { SettingsStore } from './types';
import { SETTINGS__UPDATE } from './constants';

export const settingsUpdate = (data: SettingsStore) => ({ type: SETTINGS__UPDATE, data } as const);
