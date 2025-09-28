import { PORT_NAME } from './constants';
import type { Runtime } from 'webextension-polyfill';

export type Message = {
    port: typeof PORT_NAME;
    type: string;
    body?: any;
    id: string;
};

export type Callback = (body: any, sender: Runtime.MessageSender) => void | Promise<any>;

export type Callbacks = { [type: string]: Callback };
