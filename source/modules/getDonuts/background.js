import request from 'request';
import * as cheerio from 'cheerio';
import browser from 'webextension-polyfill';

import { REQUEST_DONATS } from './utils';

browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === REQUEST_DONATS) {
        request('https://m.vk.com/blue_player', async function(error, response, body) {
            if (error) {
                return;
            }

            const $ = cheerio.load(body);

            const result = $('a[href="/app6887721_-130956055?act=app_r"] + .appWidget__list').html();

            browser.tabs.sendMessage(sender.tab.id, { type: REQUEST_DONATS, data: result });
        });
    }
});
