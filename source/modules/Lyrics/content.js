import browser from 'webextension-polyfill';

import { REQUEST_LYRICS, STORE_NAME } from './utils';

let callbacks = [
    (...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('LYRICS CACHE:', ...args);
        }
    },
];

browser.storage.onChanged.addListener(data => {
    if (data.hasOwnProperty(STORE_NAME)) {
        callbacks.forEach(cb => cb(data[STORE_NAME] ? data[STORE_NAME].newValue : {}));
    }
});

export const onUpdateLyrics = callback => {
    callbacks.push(callback);
};

export const offUpdateLyrics = callback => {
    callbacks = callbacks.filter(cb => cb !== callback);
};

export const requestLyrics = data => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('REQUESTED LYRICS FOR: ', data);
    }

    browser.runtime.sendMessage({ type: REQUEST_LYRICS, data });
};

export const getLyricsStore = callback =>
    browser.storage.local
        .get(STORE_NAME)
        .then(({ [STORE_NAME]: savedStore }) => callback(savedStore ? savedStore : {}));
