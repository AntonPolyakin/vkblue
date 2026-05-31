
import * as cheerio from 'cheerio';
import trim from 'lodash/trim';
import browser from 'webextension-polyfill';
import Fuse from 'fuse.js';

import { REQUEST_LYRICS, STORE_NAME } from './utils';
import { createArtistAndTitleKey } from '../keyCreators/createArtistAndTitleKey';
import { storageGet, storageSet } from '../LocalStorage/storage';
import { matchURLPatterns, parseURL } from '../../utils/js-utils';
import { getSearxInstances } from '../../utils/get-searx-instances';

const manifest = browser.runtime.getManifest();

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
            $('[class^="Lyrics__Container"]').find('[class^="LyricsHeader__Container"]').remove();
            return cheerioObjectToText($('[class^="Lyrics__Container"], .lyrics'));
        },
    },
];

const findLinks = (cheerioLinks, artist, title) => {
    const $ = cheerio.load('');
    const list = Array.from(cheerioLinks).map(link => {
        const text = $(link).text();
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
    return new Promise(async resolve => {
        try {
            const res = await fetch(url);
            const body = await res.text();

            const $ = cheerio.load(body, {
                normalizeWhitespace: true,
            });

            const lyrics = getLyrics($);

            if (lyrics) {
                resolve(lyrics);
            } else {
                resolve(null);
            }
        } catch (error) {
            resolve(null);
        }

    });
};

const SEARX_BLACKLIST_STORE_NAME = 'SEARX_BLACKLIST';
const SEARX_BLACKLIST_LIMIT = 5;

let domainPromise = null;
const searxBlacklist = {};



const isBlacklisted = url => {
    const key = parseURL(url).domain;
    return (searxBlacklist[key] || 0) >= SEARX_BLACKLIST_LIMIT;
};

const saveBlacklist = async () => {
    await storageSet({
        [SEARX_BLACKLIST_STORE_NAME]: searxBlacklist,
    });
};

const loadBlacklist = async () => {
    const result = await storageGet(SEARX_BLACKLIST_STORE_NAME);
    const saved = result?.[SEARX_BLACKLIST_STORE_NAME];
    if (saved && typeof saved === 'object') {
        Object.assign(searxBlacklist, saved);
    }
};

const markSearxFailure = async (url, addToBlacklist) => {
    const key = parseURL(url).domain;
    searxBlacklist[key] = addToBlacklist ? SEARX_BLACKLIST_LIMIT : (searxBlacklist[key] || 0) + 1;

    if (searxBlacklist[key] >= SEARX_BLACKLIST_LIMIT) {
        domainPromise = null; // сбросим кэш, чтобы выбрать другой инстанс
    }

    await saveBlacklist();
};

const clearSearxBlacklist = async () => {
    for (const key of Object.keys(searxBlacklist)) {
        delete searxBlacklist[key];
    }
    domainPromise = null;
    await storageSet({ [SEARX_BLACKLIST_STORE_NAME]: {} });
};

loadBlacklist();

browser.runtime.onInstalled.addListener(() => {
    clearSearxBlacklist();
});

const SEARCH_ENGINES = [
    {
        id: 'xo',//bad request
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
        id: 'startpage',//captcha
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
        id: 'ask',//bad request
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
        id: 'bing',//captcha
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
        id: 'duckduckgo',//captcha
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
    {
        id: 'searx',
        buildRequest: (() => {
            return async ({ artist, title }) => {
                if (!domainPromise) {
                    domainPromise = getFastestSearxDomain().catch(() => 'https://searxng.website/searxng/');
                }

                let domain = await domainPromise;

                if (isBlacklisted(domain)) {
                    domainPromise = null;
                    domain = await getFastestSearxDomain().catch(() => 'https://searxng.website/searxng/');
                }

                const query = `${title} ${artist} (${SITES.map(site => `site:${site.url}`).join(' OR ')})`;
                let body = `q=${encodeURIComponent(query)}&category_general=1&language=all&safesearch=0&theme=simple`;
                return {
                    url: `${domain}search?${body}`,
                    method: 'GET',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    },
                    //body: body,
                };
            };
        })()
        ,
        getUrl({ artist, title, body }) {
            const $ = cheerio.load(body);
            const results = $('#main_results');
            const links = results.find('.result a.url_header');
            return findLinks(links, artist, title);
        },
        isOk: async (res) => {
            let hasCaptcha = res.redirected && res.url.includes('captcha');

            if (hasCaptcha) {
                await markSearxFailure(res.url, true);
            }

            return res.ok && !hasCaptcha
        },
        onFailRequest: async (reqOptions) => {
            await markSearxFailure(reqOptions.url);
        }
    }
];

function getSearchEngines(ids) {
    return ids ? SEARCH_ENGINES.filter(item => ids.includes(item.id)) : [];
};

async function getFastestSearxDomain() {
    const instancesResult = await (await fetch('https://searx.space/data/instances.json', {
        headers: {
            accept: '*/*',
            'accept-language': 'ru,en;q=0.9',
            'cache-control': 'no-cache',
            pragma: 'no-cache',
        },
        method: 'GET',
    })).json();

    const topFastestInstances = getSearxInstances(
        Object.keys(instancesResult.instances)
            .map(url => ({ ...instancesResult.instances[url], url }))
    )
        .filter(item => {
            return !item.error &&
                item.network_type === 'normal' &&
                matchURLPatterns(item.url, manifest?.host_permissions || []) &&
                !isBlacklisted(item.url);
        });

    let url = topFastestInstances?.[0]?.url || 'https://searxng.website/searxng/';

    let preferencesUrl = (`${url}preferences?preferences=eJx1WMmS67oN_Zp4o0rXfbkZKguvUpVtUpW3V0EkJOGJItQcbKu_PqBkWmTLd9EDQYIEMRwcSkHAgR2hvw5o0YG5GFZg8OriBWJgxfNiMOB1YB4MXnq4kWLbOvRsbuiulxnDyPr63__87_eLhx49glPj9ccljDjj1VPa4CLrowm-FVWL9zZAd_03GI8XzXRsxiDDD3bDZVdrfVjFFg1uuii0AV0LhgY7y_9P_c-Ibm3JtoGCLN2Fuw3pMLVfcG09GlTh-ruLeBk5TLj6q8YexKpLdKbt2c0QAtnhujgMYb1o8tAZ1C3agax46Offf-wbNzfSyL5t979_-su__vbjx_JoW5phwDT-5wBD23pWBKaZUROIEFQfbaEkl-2w8eLkqVAtpPs57zUaiJpkbo6eVJoyixjZGLLx0SygprSdbBvSnLXgm2Q53bBtezL7SdZDm8KxDZapmck5dsWCRWLQyO90pKs0QZJAQ96fTbPbX95DhCc_WXqwb-40UVZ1wQcIJKE6VDsgHc877uIJqM8Hd2Qo_RQndBTUGAPWoi6qCUPWYnDaIWhJp-8x6oKmYThuusk_lFIfutxSgRrXRq7yzdMKHBQWK8feO-zlGEVoFYpMI36lg3PgNG4OkB1YKsZtkhuBDeKaYit0fCddLJIbpZ-BmztCEh5ze9xmWGRT-Z20Z_6DlnSXY9VvZcL22nHaPt-7J6vDCGGWGi6XGTFVVcHqHUpKch_u4LDR5KTMUsHtDukd2YlAlQrrWtxjQPoapWgLiRQydNmhrLFDNzyHMocSDp7zmHmLZKm-AdU5e57ylO6vpH_KTmn6lHs1sgFXRu85sxhYU2H4w2PlzMw3wnJDgRZ0Kc-S80qrRugcpF_PC434yDd3ouM_Uo1vYzLNwj68bB_jILA09KAw6x6SRkMAj8G_mfKSs6-EpVl3h-9oHqIrrCMLxSUkgZylsJYLPmktq-8P8iMf-0l1OnBrk3qLp8JZeYL7RhwySAMonWK48wE_XDZSWgyoBWweUqorybjGCBxnqU2ulZ8SbZacJ3YFOE5nvXosy5mNgTmDCi9opQM-yrAnmViBxd2SyOHCxa12MCCfgUYQWcKOvqzjhR7QSYqc8jNPnJJR2tGz7Zx1XlNVWi-xE7i6ZStiZ0g1mmcgu-9x9ILXVp9Rmuz5hM-7IFG9-y76xcqT9Q61pnDCWcchSBMXmwJjUb3SpvvRh1OdeB74TUvYxadDd_EdlSDYy27p5yp6_7GsQlhy1ijQek2AMsdnau-B-7NUPp7kkpUwH8YGnlYOLCk_peTMaRCScYIdEF9nh6rMVrAaH-fbPOVbZzgaROqWfkG1IcqRkr_9_PmPx3GojhrtcYTgPeKbeD7lVUA3tFrIcDj07daTJWC3aBIvTF02rBusdAIsuaxAWNv5kF1cnbGLztkRu3XAORf6guhC7MrS3BJGjJrExvsdu2JqBfWmjlychbUVy-78oImtVETjV8t2TR3tlW-3IRVxoR8fd0HKQnCTxrjRqqeRgl0HNHmOTqEQjnyDafgYuKg-j9YrR4GEqBbhEa4mAC8QtnOhTX4R3HlPONv2yc53XlUNU_XvrK-mVVT2XHAPupXZ00mqKZiXI802dlXunLZ7UoZD2G2-qcdvmFqSVvHfJKfwV0ys2HTpymFCWskeX8KVGrGfOHkmu1R6wl2nJClVV1zKoYrOiQPWUpbY1jew0Xpo5G1AUvm0zRSrhXpLIo8xE5S0nTJ8jlNyXyqXSvtF2t5Lz54s5k7eK-YqX8sjBlcsT8CwzmwlS4oU7KUpTGWz71erSyX5j6I_EmRIeJ3ZiBCxwwfD_KgUNyZUSkZIXtuN3PnIc8k2mMQQ8CU7wHlemwy-O-7V7WNfET26X80lrvSrubSzXObNtGTprYqYiYp0mXgzyFtIs_3F4a_pEfwojeDNCn3wmIdkTtSHi2f-Gqk8fr4LmFUCEDqNmS1uVEUY98H2asqS5vb2D89MruefNOx7sfkgnD7IyyE_HxadMPnQXfCBpiIi8qROPfW5nBJ3FTJTUKPMVMqzDvqSc7uYi514rDp0XTK8bWSlXL2Rj1LgQF7HTSeY4MvHlkN5GrqjVPbj59VTqBLWSz-EbHBNK6plHAVG6xjKa05NLHjVG75nOPZT7KINMTeFKFQ6-lccPUpcBbHfvTh8eggu4ufq4CysK_8Qv2FKhrQ8zNye-O-4yrF9tF7eMX48cZMKW2HkCsdWjt-a90vyeuwCGYGi_b3_WnajufrMcadu_Q6lHfPkvwuryyfBZ-Q6kBt52nr0SZopVSXeWE-qiAyTaWlqPhsJrHe48fotLEmawEVK7eMUgXLyhOXl5LcvO-XUFrYjenc2vZOXi1nGus-QCl9sK9tm4T2zPMyb4MB6ecejrjP-yyZuWyhsVLGUbCSuToG6l97ZaUtTyZA5pE8Jb760pGsJDarg7h6C-6CCxgo83apbbIKzb3fxmV9s4pqIhL_mzzvHF77FRGFc_vpiYFlgwA4xBVkUwmbR_r3R8DAIYZMHgKDl9f_a9gIg`);

    try {
        await fetch(preferencesUrl, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "ru,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "none",
                "sec-fetch-storage-access": "active"
            },
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });
    } catch (error) {

    }


    return url;
}

const store = {};

storageGet(STORE_NAME).then((result) => {
    const savedStore = result?.[STORE_NAME];
    if (savedStore) {
        Object.assign(store, savedStore);
    }
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

        let engines = getSearchEngines(['searx']);

        for (const engine of engines) {
            lyrics = await new Promise(async resolve => {
                const reqOptions = engine.buildRequest ? await engine.buildRequest(data) : { url: engine.buildUrl(data) };

                try {
                    const res = await fetch(reqOptions.url, {
                        method: reqOptions.method || 'GET',
                        headers: reqOptions.headers,
                        body: reqOptions.body,
                    });

                    if ((engine.isOk ? !engine.isOk(res) : !res.ok)) {
                        if (engine?.onFailRequest) {
                            await engine.onFailRequest(reqOptions);
                        }
                        return resolve(null);
                    }

                    const body = await res.text();

                    const urls = await engine.getUrl({ artist: data.artist, title: data.title, body });
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
                } catch (error) {
                    if (engine?.onFailRequest) {
                        await engine.onFailRequest(reqOptions);
                    }
                    return resolve(null);
                }

            });
            if (lyrics) break;
        }


        if (lyrics) {
            lyrics = trim(lyrics);
            store[key] = lyrics;
        } else {
            store[key] = null;
        }

        storageSet({ [STORE_NAME]: store });

    }
});
