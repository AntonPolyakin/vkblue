// import browser from 'webextension-polyfill';
// import { EVENT_NAME } from './vendor';

// browser.commands.onCommand.addListener(command => {
//     browser.tabs.query({ url: '*://vk.com/*' }).then(tabs => {
//         let { id } = tabs.find(({ audible }) => audible) || tabs[0];
//
//         browser.tabs.sendMessage(id, { action: EVENT_NAME, command });
//     });
// });
