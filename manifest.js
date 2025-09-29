const manifestVersion = +process.env.MANIFEST_VERSION;
const permissions = [
    'tabs',
    'storage',
    'unlimitedStorage',
    'identity',
    'contextMenus',
    'alarms'
];
const hostPermissions = [
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
];
const resources = ['*.mp3', '*.png', '*.jpg', '*.gif', '*.ttf', '*.svg', '*.wav', '*.webp', "page.js"];
const manifest = Object.assign({
    manifest_version: manifestVersion,
    name: '__MSG_extName__',
    short_name: 'VK Blue',
    description: '__MSG_extDescription__',
    version: '0.7.00',
    version_name: '0.7.00 beta 4',
    author: 'hadaev.ivan@gmail.com',
    default_locale: 'ru',
    homepage_url: 'https://vk.com/blue_player',
    icons: {
        '128': 'icon-128.png',
    },
    background: manifestVersion == 2 ? {
        scripts: ['background.js']
    } : {
        service_worker: "serviceWorker.js"
    },
    [manifestVersion == 2 ? 'browser_action' : 'action']: {
        default_icon: 'icon-128.png',
        default_title: '__MSG_extDefaultTitle__',
    },
    content_scripts: [
        {
            run_at: 'document_start',
            matches: ['*://vk.com/*'],
            css: ['content.css'],
            js: ['inject.js', 'content.js'],
        },
    ],
    permissions: manifestVersion == 2 ? [...permissions, ...hostPermissions] : permissions,


}, manifestVersion == 2 ? {
    web_accessible_resources: resources,
    content_security_policy: "script-src 'self' https://ssl.google-analytics.com; object-src 'self'",
} : {
    host_permissions: hostPermissions,
    web_accessible_resources: [
        {
            resources: resources,
            matches: [
                "<all_urls>"
            ]
        }
    ],
    content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'"
    },
});

if (process.env.BROWSER === 'chrome') {
    manifest.minimum_chrome_version = manifestVersion == 2 ? '40' : '88';
    if (process.env.MANIFEST_KEY) {
        manifest.key = ENV.MANIFEST_KEY
    }
}

module.exports = manifest;
