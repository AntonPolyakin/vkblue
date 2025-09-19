export const getCurrentAudio = async () => {
    const currentAudio = await new Promise(resolve => {
        const message = { type: 'getCurrentAudio', key: Math.random() };
        let timer = null;

        window.postMessage(message, window.location.origin);
        const handleMessage = event => {
            if (event.data && event.data.type === 'sendCurrentAudio' && event.data.key === message.key) {
                window.removeEventListener('message', handleMessage);
                window.clearTimeout(timer);
                resolve(window.document.getElementById(event.data.id));
            }
        };

        timer = setTimeout(() => {
            window.removeEventListener('message', handleMessage);
            resolve(null);
        }, 500);

        window.addEventListener('message', handleMessage);
    });

    return currentAudio;
};
