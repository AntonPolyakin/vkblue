const getCurrentVkAudio = () => {
    if (window.ap && window.ap._impl._currentAudioEl) {
        return window.ap._impl._currentAudioEl.audioElement
            ? window.ap._impl._currentAudioEl.audioElement
            : window.ap._impl._currentAudioEl;
    }
    return null;
};

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'getCurrentAudio') {
        const currentAudio = getCurrentVkAudio();

        window.postMessage(
            { type: 'sendCurrentAudio', key: event.data.key, id: currentAudio.id },
            window.location.origin,
        );
    }
});
