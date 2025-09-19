import clearString from '../../utils/clear_string';

const AudioUtils = {
    ADS: 15,
    ALBUM_ID: 6,
    AUTHOR_LINK: 8,
    CONTEXT: 11,
    COVER_URL: 14,
    DURATION: 5,
    EXTRA: 12,
    FEAT_ARTISTS: 18,
    FLAGS: 10,
    HASHES: 13,
    ID: 0,
    LYRICS: 9,
    MAIN_ARTISTS: 17,
    OWNER_ID: 1,
    PERFORMER: 4,
    SUBTITLE: 16,
    TITLE: 3,
    URL: 2,
};

function parseAudio(data) {
    let track = null;

    Object.keys(AudioUtils).forEach(key => {
        const name = key.toLowerCase();
        let value = data[AudioUtils[key]];

        if (['performer', 'title'].includes(name)) {
            value = clearString(value);
        }

        if (!track) {
            track = {};
        }

        track[name] = value;
    });

    return track;
}

export const getCurrentInfo = () => {
    const keyAudioInLocalStorage = Object.keys(localStorage).find(function(key) {
        return key.startsWith('audio_') && key.includes('_track');
    });

    return parseAudio(JSON.parse(localStorage.getItem(keyAudioInLocalStorage)));
};
