import { browser, Runtime } from 'webextension-polyfill-ts';
import { PORT_NAME } from './constants';
import { Callback, Callbacks, Message } from './types';

const callbacks: Callbacks = {};

browser.runtime.onMessage.addListener(async (message: Message, sender: Runtime.MessageSender) => {
    if (message.port === PORT_NAME && callbacks[message.type]) {
        const result = await callbacks[message.type](message.body, sender);

        if (result !== false) {
            const responseMessage = { ...message, body: result };
            browser.tabs.sendMessage(sender.tab.id, responseMessage);
        }
    }
});

export const on = (eventName: string, callback: Callback) => {
    callbacks[eventName] = callback;
};
