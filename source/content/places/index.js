const HEADER_VISUALIZER_CONTAINER_ID = Date.now() + Math.random() * 1000000 + '';
const MAIN_PLAYER_CONTAINER_ID = 'blue-mp-' + Date.now() + Math.random() * 1000000 + '';
const HEADER_PLAYER_CONTAINER_ID = 'blue-hp-' + Date.now() + Math.random() * 1000000 + '';
const PANEL_BUTTONS_CONTAINER_ID = Date.now() + Math.random() * 1000000 + '';
const LAST_FM_BUTTONS_CONTAINER_ID = Date.now() + Math.random() * 1000000 + '';

const OBSERVERS = [
    {
        name: 'header-visualizer',
        selector: '#top_audio_player',
        filterMount: () => !window.document.getElementById(HEADER_VISUALIZER_CONTAINER_ID),
        filterUnmount: () => true,
        createContainer: node => {
            const parent = node;
            const container = window.document.createElement('div');

            container.onclick = function() {
                window.document.getElementById('l_aud').firstChild.click();
            };
            container.className = 'top_nav_btn';
            container.style = `
                display: inline-block;
                position: relative;
                width: 30px !important;
                height: 42px;
                cursor: pointer;
                padding: 0 8px !important;
            `;
            container.id = HEADER_VISUALIZER_CONTAINER_ID;
            parent.parentNode.insertBefore(container, node);

            return container;
        },
    },
    {
        name: 'main-player',
        selector:
            '#page_body div[class*="AudioPlayerBlockSectionsLayout__root"] div[class*="AudioPlayerPlaybackBody__audioInfo"]',
        filterMount: () => {
            return !window.document.getElementById(MAIN_PLAYER_CONTAINER_ID);
        },
        filterUnmount: () => {
            return true;
        },
        createContainer: node => {
            const container = window.document.createElement('div');
            container.id = MAIN_PLAYER_CONTAINER_ID;
            container.className = 'vkuiGroup--mode-card';
            container.style = `
                overflow: hidden;
            `;
            const block = node.closest('.vkui__root');
            block.insertBefore(container, block.firstChild);

            return container;
        },
    },
    {
        name: 'top-player',
        selector: '#page_header #top_audio_layer_place div[class*="AudioPlayerBlockSectionsLayout__root"]',
        filterMount: node => {
            return (
                !window.document.getElementById(HEADER_PLAYER_CONTAINER_ID) &&
                node.closest('div[class*="AudioPlayerBlockCompactLayout__root"]')
            );
        },
        filterUnmount: () => {
            return true;
        },
        createContainer: node => {
            const container = window.document.createElement('div');
            container.id = HEADER_PLAYER_CONTAINER_ID;
            const block = node.closest('._audio_page_layout');
            block.insertBefore(container, block.firstChild);

            return container;
        },
    },
    {
        name: 'panel-buttons',
        selector: `#page_body div[class*="AudioPlayerUserControlsContainer__userButtonsContainer"]`,
        filterMount: () => {
            return !window.document.getElementById(PANEL_BUTTONS_CONTAINER_ID);
        },
        filterUnmount: () => {
            return true;
        },
        createContainer: node => {
            const container = window.document.createElement('div');
            container.id = PANEL_BUTTONS_CONTAINER_ID;
            container.style = `
                float: left;
                position: relative;
            `;
            node.insertBefore(container, node.firstChild);

            return container;
        },
    },
    {
        name: 'lastfm-buttons',
        selector: '#page_body div[class*="AudioPlayerPlaybackBody__audioButtons"]',
        filterMount: () => {
            return !window.document.getElementById(LAST_FM_BUTTONS_CONTAINER_ID);
        },
        filterUnmount: () => {
            return true;
        },
        createContainer: node => {
            const container = window.document.createElement('div');
            container.id = LAST_FM_BUTTONS_CONTAINER_ID;
            container.style = `
                width: 24px;
                height: 24px;
                margin-right: 8px;
                overflow: visible;
            `;
            node.appendChild(container);

            return container;
        },
    },
];

class DOMObservers {
    constructor() {
        this.added = {};
        this.removed = {};
        this.addCallbacks = [];
        this.removeCallbacks = [];
        const observe = () => {
            OBSERVERS.forEach(observer => {
                if (!window.document.body) return;

                var element = window.document.body.querySelector(observer.selector);

                if (element) {
                    if (this.added[observer.name]) return;
                    if (!observer.filterMount(element)) return;

                    const container = observer.createContainer(element);

                    this.added[observer.name] = container;
                    this.removed[observer.name] = null;

                    this.addCallbacks.forEach(({ name, callback }) => {
                        if (observer.name === name) {
                            callback(container);
                        }
                    });
                } else {
                    if (!this.added[observer.name]) return;
                    if (!observer.filterUnmount(this.added[observer.name])) return;

                    const container = this.added[observer.name];
                    this.removed[observer.name] = container;
                    this.added[observer.name] = null;

                    this.removeCallbacks.forEach(({ name, callback }) => {
                        if (observer.name === name) {
                            callback(container);
                        }
                    });
                }
            });
        };

        const run = () => {
            try {
                observe();
            } catch (err) {
                console.error('FUCK!');
                console.error(err);
            }
        };

        this.observer = new MutationObserver(run);

        this.observer.observe(window.document, {
            childList: true,
            subtree: true,
            attributes: false
        });

        this.onAdd = this.onAdd.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }

    onAdd(name, callback) {
        if (this.added[name]) {
            callback(this.added[name]);
        }
        this.addCallbacks.push({ name, callback });
    }

    onRemove(name, callback) {
        if (this.removed[name]) {
            callback(this.removed[name]);
        }
        this.removeCallbacks.push({ name, callback });
    }
}

export const places = new DOMObservers();
