import browser from 'webextension-polyfill';
import {storageClear} from '../../modules/LocalStorage/storage';

browser.runtime.onMessage.addListener(async message => {
    if (message.type === 'RESET_APP') {
        localStorage.clear();
        await storageClear();
        await browser.runtime.reload();
    }
});
