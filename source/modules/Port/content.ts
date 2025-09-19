import { browser } from 'webextension-polyfill-ts';
import { PORT_NAME } from './constants';
import { Message } from './types';

export const send = (messageType: string, messageBody?: any) => {
    const messageId = `${Date.now()}=${Math.random()}`;
    const message: Message = { port: PORT_NAME, id: messageId, type: messageType, body: messageBody };
    browser.runtime.sendMessage(message);

    return new Promise(resolve => {
        const handle = ({ port, type, id, body }: Message) => {
            if (port === PORT_NAME && type === messageType && messageId === id) {
                window.clearTimeout(timer);
                resolve(body);
            }
        };

        const timer = window.setTimeout(() => {
            browser.runtime.onMessage.removeListener(handle);
            resolve(null);
        }, 10000);
        browser.runtime.onMessage.addListener(handle);
    });
};
