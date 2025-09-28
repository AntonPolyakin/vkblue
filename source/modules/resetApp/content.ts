import browser from 'webextension-polyfill';

export const resetApp = () => browser.runtime.sendMessage({ type: 'RESET_APP' });
