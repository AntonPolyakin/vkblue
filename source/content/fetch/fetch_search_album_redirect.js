import browser from 'webextension-polyfill';

export default function (search) {
    if (typeof search !== 'string') {
        return { type: '@@NOOP' };
    }

    const script = document.createElement('script');
    script.src = browser.runtime.getURL('search_album_redirect_injection.js');
    script.dataset.search = search;
    script.id = 'vk_lyrics_chrome_extension_script';

    document.documentElement.appendChild(script);

    return { type: 'SEARCH_ALBUM_STARTED', payload: search };
}