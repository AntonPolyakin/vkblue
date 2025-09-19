import browser from 'webextension-polyfill';

const getCallbackURL = () => {
    const getRedirectURL = browser.identity.getRedirectURL.bind(browser.identity);
    return getRedirectURL('auth.html');
};

export default function getUserToken() {
    return new Promise((resolve, reject) => {
        const callbackURL = getCallbackURL();

        browser.identity
            .launchWebAuthFlow({
                interactive: true,
                url: `http://www.last.fm/api/auth/?api_key=${process.env.LAST_FM_API_KEY}&cb=${callbackURL}`,
            })
            .then(url => {
                if (typeof url === 'string') {
                    const matches = url.match(/token=([^&]+)/);

                    if (matches) {
                        const token = matches[1];
                        resolve(token);
                    } else {
                        reject('');
                    }
                } else {
                    reject('');
                }
            });
    });
}
