import { browser } from 'webextension-polyfill-ts';

export const resetApp = () => browser.runtime.sendMessage({ type: 'RESET_APP' });
