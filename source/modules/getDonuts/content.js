import browser from 'webextension-polyfill';

import { REQUEST_DONATS } from './utils';

let donuts;

export const getDonuts = async () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('REQUESTED DONUTS');
    }

    if (donuts) {
        return Promise.resolve(donuts);
    }

    browser.runtime.sendMessage({ type: REQUEST_DONATS });

    return await new Promise(resolve => {
        setTimeout(resolve, 10000);

        browser.runtime.onMessage.addListener(request => {
            if (request.type === REQUEST_DONATS) {
                donuts = request.data;
                resolve(request.data);
            }
        });
    });
};
