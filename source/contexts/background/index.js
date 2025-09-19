import browser from 'webextension-polyfill';

import '../../modules/reloadAllTabs/background';
import '../../modules/resetApp/background';
import '../../modules/getDonuts/background';
import '../../services/MediaKeys/background';
import '../../../modules/LastFMInfo/background';
import '../../../modules/LastFMScrobbler/background';
import '../../modules/Lyrics/background';

import './analytics';

(async () => {
    browser.browserAction.onClicked.addListener(function callback() {
        browser.tabs.create({ url: 'https://vk.com/audios0000' });
    });

    browser.tabs.query({ url: '*://vk.com/*' }).then(function(tabs) {
        tabs.forEach(function(tab) {
            browser.tabs.reload(tab.id);
        });
    });

    browser.runtime.onInstalled.addListener(function({ reason, previousVersion }) {
        if (reason === 'install') {
            browser.tabs.create({ url: 'https://vk.com/audios0000' });
            console.log('Blue. Extension installed. Storage cleared.');
        }

        if (reason === 'update') {
            let thisVersion = browser.runtime.getManifest().version;

            if (thisVersion === previousVersion) {
                console.log(`Blue. Reload: '${thisVersion}'.`);
            } else {
                console.log(`Blue. Install: updated from '${previousVersion}' to '${thisVersion}'.`);
            }
        }
    });

    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
        contexts: ['browser_action'],
        id: 'reset_app',
        title: 'Сбросить настройки',
    });

    browser.contextMenus.onClicked.addListener(async ({ menuItemId }) => {
        if (menuItemId === 'reset_app') {
            localStorage.clear();
            await browser.storage.local.clear();
            await browser.runtime.reload();
        }
    });
})();
