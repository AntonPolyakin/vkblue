import browser from 'webextension-polyfill';

export const storageGet = (keys: string | Array<string>) => {
    const isString = typeof keys == 'string';
    return browser.storage.local.get(keys).then(response => (typeof response === 'object' ? isString ? response?.[keys] || null : response : null));
}

export const storageSet = (keyOrObject: string | { [key: string]: any }, data?: any): Promise<void> => {
    if (typeof keyOrObject === 'string' && data !== undefined) {
        return browser.storage.local.set({ [keyOrObject]: data });
    } else if (typeof keyOrObject === 'object' && keyOrObject !== null) {
        return browser.storage.local.set(keyOrObject);
    } else {
        return Promise.reject(new Error('Invalid arguments'));
    }
};

export const storageRemove = (keys: string | string[]) => {
    return browser.storage.local.remove(keys);
}

export const storageClear = () => {
    return browser.storage.local.clear();
};
