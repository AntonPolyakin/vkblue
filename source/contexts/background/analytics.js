import browser from 'webextension-polyfill';

const TRACKING_ID = 'UA-100467281-1';
const manifestVersion = browser.runtime.getManifest().manifest_version;

if (manifestVersion === 2) {
    window._gaq = window._gaq || [];
    _gaq.push(['_setAccount', TRACKING_ID]);

    (function() {
        const ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        const s = document.getElementsByTagName('script')[0];
        if (s.parentNode) s.parentNode.insertBefore(ga, s);
    })();

    browser.runtime.onMessage.addListener(message => {
        if (message.type === 'TICK_ANALYTIC') {
            _gaq.push(['_trackPageview', 'blue']);
        }
    });

} else if (manifestVersion === 3) {
    function sendPageview(path = '/blue') {
        const payload = new URLSearchParams({
            v: '1',                   // protocol version
            tid: TRACKING_ID,         // tracking id
            cid: crypto.randomUUID(), // client id (рандомный UUID)
            t: 'pageview',            // hit type
            dp: path                  // document path
        });

        fetch('https://www.google-analytics.com/collect', {
            method: 'POST',
            body: payload.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).catch(() => {});
    }

    browser.runtime.onMessage.addListener(message => {
        if (message.type === 'TICK_ANALYTIC') {
            sendPageview('/blue');
        }
    });
}
