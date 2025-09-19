import { browser } from 'webextension-polyfill-ts';

export const storageGet = (key: string) =>
    browser.storage.local.get(key).then(response => (typeof response === 'object' ? response[key] : null));

export const storageSet = (key: string, data: any) => browser.storage.local.set({ [key]: data });
