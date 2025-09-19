import { browser } from 'webextension-polyfill-ts';

browser.runtime.onMessage.addListener(message => {
    if (message.type === 'RELOAD_ALL_TABS') {
        browser.tabs.query({ url: '*://vk.com/*' }).then(tabs => {
            tabs.forEach(function(tab) {
                browser.tabs.reload(tab.id);
            });
        });
    }
});
