import browser from 'webextension-polyfill';
import { EVENT_NAME } from './vendor';

browser.runtime.onMessage.addListener(function({ action, command }) {
    if (action === EVENT_NAME) {
        if (window.document.querySelector('.top_audio_player_enabled')) {
            switch (command) {
                case 'next': {
                    window.document.querySelector('.top_audio_player_next').click();
                    return;
                }
                case 'prev': {
                    window.document.querySelector('.top_audio_player_prev').click();
                    return;
                }
                default: {
                    window.document.querySelector('.top_audio_player_play').click();
                }
            }
        } else {
            window.document.querySelector('.top_audio_play__button').click();
        }
    }
});
