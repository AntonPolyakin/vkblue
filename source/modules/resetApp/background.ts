import { browser } from 'webextension-polyfill-ts';

browser.runtime.onMessage.addListener(async message => {
    if (message.type === 'RESET_APP') {
        localStorage.clear();
        await browser.storage.local.clear();
        await browser.runtime.reload();
    }
});
