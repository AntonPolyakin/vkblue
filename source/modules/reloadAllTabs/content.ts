import { browser } from 'webextension-polyfill-ts';

export const reloadAllTabs = () => browser.runtime.sendMessage({ type: 'RELOAD_ALL_TABS' });
