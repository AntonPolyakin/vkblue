import '../../modules/subscribeToGroup/page';

const EVENT_TYPES = ['play', 'pause', 'stop', 'playing'];
const getCurrentAudio = () => {
    if (window.ap && window.ap._impl._currentAudioEl) {
        return window.ap._impl._currentAudioEl.audioElement
            ? window.ap._impl._currentAudioEl.audioElement
            : window.ap._impl._currentAudioEl;
    }
    return null;
};
const postMessage = (type, audioId) => {
    const message = { type: 'CURRENT_AUDIO', eventType: type, audioId };

    window.postMessage(message, window.location.origin);
};

let prevTimestampOfTimeupdate = 0;

const _Audio = window.Audio;
window.Audio = function(src) {
    const audio = new _Audio(src);

    const id = '' + Date.now() + '_' + Math.random();
    audio.setAttribute('id', id);

    audio.addEventListener('timeupdate', function(event) {
        const currentAudio = getCurrentAudio();

        if (currentAudio === event.target) {
            const now = Date.now();
            const diff = now - prevTimestampOfTimeupdate;
            if (diff > 1000) {
                postMessage(event.type, currentAudio.id);
                prevTimestampOfTimeupdate = now;
            }
        }
    });

    EVENT_TYPES.forEach(function(eventName) {
        audio.addEventListener(eventName, function(event) {
            const currentAudio = getCurrentAudio();

            if (currentAudio === event.target) {
                postMessage(event.type, currentAudio.id);
            }
        });
    });

    document.head.appendChild(audio);
    return audio;
};

let _createMediaElementSource = window.AudioContext.prototype.createMediaElementSource;

window.AudioContext.prototype.createMediaElementSource = function(audio) {
    let mediaSource;
    try {
        mediaSource = _createMediaElementSource.call(this, audio);
    } catch (error) {
        mediaSource = _createMediaElementSource.call(this, new _Audio());
    }

    return mediaSource;
};
