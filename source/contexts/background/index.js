import browser from 'webextension-polyfill';
import 'webextension-polyfill/dist/browser-polyfill.min.js';

(async () => {
  await import('../../modules/reloadAllTabs/background');
  await import('../../modules/resetApp/background');
  await import('../../modules/getDonuts/background');
  await import('../../services/MediaKeys/background');
  await import('../../../modules/LastFMInfo/background');
  await import('../../../modules/LastFMScrobbler/background');
  await import('../../modules/Lyrics/background');

  await import('./analytics');

    (browser.browserAction || browser.action).onClicked.addListener(() => {
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
