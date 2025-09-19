import request from 'request';
import cheerio from 'cheerio';
import trim from 'lodash/trim';
import browser from 'webextension-polyfill';
import Fuse from 'fuse.js';

import { REQUEST_LYRICS, STORE_NAME } from './utils';
import { createArtistAndTitleKey } from '../keyCreators/createArtistAndTitleKey';

const cheerioObjectToText = cheerioObject => {
    cheerioObject.find('p, div, section').append('<br/>');
    cheerioObject.find('br').replaceWith('\n');

    const text = cheerioObject.text();

    return text
        .replace(/[^\S\r\n]+/g, ' ')
        .replace(/[\n]+/g, '\n')
        .replace(/\n /g, '\n');
};

const SITES = [
    {
        url: 'gl5.ru',
        getLyrics: $ => {
            const $text = $('[itemprop="text"]');
            $text.find('a').replaceWith('\n');

            const text = cheerioObjectToText($text);

            const dirtyStrings = [
                'Друзья! Обращаем Ваше внимание:',
                'Все тексты песен(слова)',
                'Смотреть видео клип/слушать',
                'Смотреть видеоклип/слушать',
                'Отзывы об этой песне:',
            ];

            return text
                .split(/\r?\n/)
                .filter(s => /[0-9a-zA-Zа-яА-Я]/.test(s))
                .filter((str, index) => {
                    if (index < 5) {
                        return !dirtyStrings.some(s => str.indexOf(s) >= 0);
                    }

                    return true;
                })
                .join('\n');
        },
    },
    {
        url: 'megalyrics.ru',
        getLyrics: $ => cheerioObjectToText($('.text_inner')),
    },
    {
        url: 'lyricshare.net',
        getLyrics: $ => cheerioObjectToText($('.textpesnidiv')),
    },
    {
        url: 'genius.com',
        regExp: /^https?:\/\/(?:rap\.|rock\.|pop\.)?(?:rap)?genius\.com\/(?:[^\/]+-lyrics\/?|\d+)/,
        getLyrics: $ => {
            return cheerioObjectToText($('[class^="Lyrics__Container"], .lyrics'));
        },
    },
];

const findLinks = (cheerioLinks, artist, title) => {
    const list = Array.from(cheerioLinks).map(link => {
        const text = cheerio(link).text();
        const href = link.attribs.href;

        return { text, href };
    });

    const fuse = new Fuse(list, { keys: ['text'], includeScore: true, threshold: 0.4, ignoreLocation: true, caseSensitive: false });

    const results = fuse.search(title);

    return results
        .map(result => result.item.href)
        .filter(link =>
            SITES.find(site => (site.regExp ? site.regExp.test(link) : link ? link.includes(site.url) : null)),
        );
};

const fetchLyrics = async url => {
    const getLyrics = SITES.find(site => url.includes(site.url)).getLyrics;
    return new Promise(resolve =>
        request(url, function(error, response, body) {
            if (error) {
                resolve(null);
                return;
            }

            const $ = cheerio.load(body, {
                normalizeWhitespace: true,
            });
            const lyrics = getLyrics($);

            if (lyrics) {
                resolve(lyrics);
            } else {
                resolve(null);
            }
        }),
    );
};

const SEARCH_ENGINES = [
    {
        buildUrl({ artist, title }) {
            const searchUrl = 'https://xo.wtf/search?q=';
            return (
                searchUrl +
                encodeURIComponent(
                    `слова песни ${title} ${artist} (${SITES.map(site => `site:${site.url}`).join(' OR ')})`,
                )
            );
        },
        getUrl({ artist, title, body }) {
            const $ = cheerio.load(body);
            const results = $('#main_results');
            const links = results.find('.result a');

            return findLinks(links, artist, title);
        },
    },
    {
        buildUrl({ artist, title }) {
            const fixedTitle = title.split(' ').join('+');
            const fixedArtist = artist.split(' ').join('+');

            return `https://www.startpage.com/do/search?query=слова песни ${fixedTitle} ${fixedArtist} (${SITES.map(
                site => `host:${site.url}`,
            ).join(' OR ')})`;
        },
        getUrl({ artist, title, body }) {
            const $ = cheerio.load(body);
            const results = $('.w-gl__result');
            const links = results.find('a');

            return findLinks(links, artist, title);
        },
    },
    {
        buildUrl({ artist, title }) {
            const searchUrl = 'https://uk.ask.com/web?q=';
            return (
                searchUrl +
                encodeURIComponent(`${title} ${artist} (${SITES.map(site => `site:${site.url}`).join(' OR ')})`)
            );
        },
        getUrl({ artist, title, body }) {
            const $ = cheerio.load(body);
            const links = $('.result-link');

            return findLinks(links, artist, title);
        },
    },
    {
        buildUrl({ artist, title }) {
            const searchUrl = 'https://www.bing.com/search?q=';
            return (
                searchUrl +
                encodeURIComponent(`${title} ${artist} (${SITES.map(site => `site:${site.url}`).join(' OR ')})`)
            );
        },
        getUrl({ artist, title, body }) {
            const $ = cheerio.load(body);
            const results = $('#b_results');
            const links = results.find('a');

            return findLinks(links, artist, title);
        },
    },
    {
        buildUrl({ artist, title }) {
            const searchUrl = 'https://duckduckgo.com/html?q=';
            return (
                searchUrl +
                encodeURIComponent(`${title} ${artist}  (${SITES.map(site => `site:${site.url}`).join(' OR ')})`)
            );
        },
        getUrl({ artist, title, body }) {
            const $ = cheerio.load(body);
            const results = $('#links');
            const links = results.find('.result__a');

            return findLinks(links, artist, title);
        },
    },
];

const store = {};

browser.storage.local.get(STORE_NAME).then(({ [STORE_NAME]: savedStore }) => {
    Object.assign(store, savedStore ? savedStore : {});
});

browser.runtime.onMessage.addListener(async message => {
    if (message.type === REQUEST_LYRICS) {
        const data = message.data;
        const key = createArtistAndTitleKey(data.artist, data.title);
        let lyrics = store[key];

        if (store.hasOwnProperty(key)) {
            return;
        } else {
            store[key] = undefined;
        }

        for (const engine of SEARCH_ENGINES) {
            lyrics = await new Promise(resolve =>
                request(engine.buildUrl(data), async function(error, response, body) {
                    if (error) {
                        return resolve(null);
                    }

                    const urls = engine.getUrl({ artist: data.artist, title: data.title, body });

                    if (urls.length === 0) {
                        return resolve(null);
                    }

                    for (let url of urls) {
                        const siteLyrics = await fetchLyrics(url);
                        if (siteLyrics) {
                            return resolve(siteLyrics);
                        }
                    }

                    return resolve(null);
                }),
            );

            if (lyrics) {
                break;
            }
        }

        if (lyrics) {
            lyrics = trim(lyrics);
            store[key] = lyrics;
        } else {
            store[key] = null;
        }

        browser.storage.local.set({ [STORE_NAME]: store });
    }
});
