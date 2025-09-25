const ENV = require('./env');

const manifest = {
    manifest_version: 2,
    name: '__MSG_extName__',
    short_name: 'VK Blue',
    description: '__MSG_extDescription__',
    version: '0.7.00',
    version_name: '0.7.00 beta 0',
    author: 'hadaev.ivan@gmail.com',
    default_locale: 'ru',
    homepage_url: 'https://vk.com/blue_player',
    icons: {
        '128': 'icon-128.png',
    },
    background: {
        scripts: ['background.js'],
    },
    browser_action: {
        default_icon: 'icon-128.png',
        default_title: '__MSG_extDefaultTitle__',
    },
    content_scripts: [
        {
            run_at: 'document_start',
            matches: ['*://vk.com/*'],
            css: ['content.css'],
            js: ['page.js', 'content.js'],
        },
    ],
    permissions: [
        'tabs',
        'storage',
        'unlimitedStorage',
        'identity',
        'contextMenus',

        '*://vk.com/*',
        '*://m.vk.com/*',
        '*://www.gl5.ru/*',
        '*://www.megalyrics.ru/*',
        '*://megalyrics.ru/*',
        '*://genius.com/*',
        '*://lyricshare.net/*',
        '*://uk.ask.com/*',
        '*://www.bing.com/*',
        '*://duckduckgo.com/*',
        '*://xo.wtf/*',
        '*://www.startpage.com/*',
        '*://ws.audioscrobbler.com/*',
        '*://www.last.fm/*',
        '*://searx.bndkt.io/*',
    ],
    web_accessible_resources: ['*.mp3', '*.png', '*.jpg', '*.gif', '*.ttf', '*.svg', '*.wav', '*.webp'],
    content_security_policy: "script-src 'self' https://ssl.google-analytics.com; object-src 'self'",
};

if (ENV.BROWSER === 'chrome') {
    manifest.minimum_chrome_version = '40';
    if(ENV.MANIFEST_KEY){
       manifest.key = ENV.MANIFEST_KEY 
    }
}

module.exports = manifest;
