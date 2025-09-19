import browser from 'webextension-polyfill';

window._gaq = window._gaq || [];
_gaq.push(['_setAccount', 'UA-100467281-1']);

(function() {
    const ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    const s = document.getElementsByTagName('script')[0];
    if(s.parentNode) s.parentNode.insertBefore(ga, s);
})();

browser.runtime.onMessage.addListener(message => {
    if (message.type === 'TICK_ANALYTIC') {
        _gaq.push(['_trackPageview', 'blue']);
    }
});
