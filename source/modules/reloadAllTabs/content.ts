import browser from 'webextension-polyfill';

export const reloadAllTabs = () => browser.runtime.sendMessage({ type: 'RELOAD_ALL_TABS' });
