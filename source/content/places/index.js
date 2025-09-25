// improved-places.js
import { CSSToObject } from '../../utils/utils.js';
import { setVkTooltip } from '../helpers/vk-tooltip.js';

/**
 * Improved hybrid DOM observers for VK player integration.
 * - Context-aware filterMount (checks added nodes only)
 * - Robust filterUnmount (checks host presence + stabilization)
 * - Initial bootstrap scan
 * - Minimal, safe logging
 */

/* Unique IDs for our injected containers */
const UID = Date.now();
const HEADER_VISUALIZER_CONTAINER_ID = `blue-vis-${UID}-${Math.floor(Math.random() * 1e6)}`;
const MAIN_PLAYER_CONTAINER_ID = `blue-mp-${UID}-${Math.floor(Math.random() * 1e6)}`;
const HEADER_PLAYER_CONTAINER_ID = `blue-hp-${UID}-${Math.floor(Math.random() * 1e6)}`;
const PANEL_BUTTONS_CONTAINER_ID = `blue-pb-${UID}-${Math.floor(Math.random() * 1e6)}`;
const LAST_FM_BUTTONS_CONTAINER_ID = `blue-lf-${UID}-${Math.floor(Math.random() * 1e6)}`;

/* Stabilization delay before confirming an unmount (ms) */
const UNMOUNT_STABILIZE_MS = 250;

/* Observers configuration:
   - hostSelector: stable area to check for unmount (or null)
   - targetSelector: element we react to being added (passed as node context)
   - filterMount(node): context-aware check for whether we should create
   - filterUnmount(addedContainer): check whether container should be removed
   - createContainer(node): create and insert container (returns container element)
*/
const OBSERVERS = [
  {
    name: 'header-visualizer',
    hostSelector: '#top_audio_player', // host anchor presence means header area exists
    targetSelector: '#top_audio_player', // target to watch for additions
    filterMount(node) {
      const sel = this.targetSelector;
      const element = (node.matches && node.matches(sel)) ? node : node.querySelector && node.querySelector(sel);
      return !!element && !document.getElementById(HEADER_VISUALIZER_CONTAINER_ID);
    },
    filterUnmount(/* addedContainer */) {
      // remove only when top audio player host no longer exists
      return !document.querySelector(this.hostSelector);
    },
    createContainer(node) {
      const parent = node.matches(this.targetSelector) ? node : node.querySelector(this.targetSelector);
      if (!parent) return null;
      const container = document.createElement('div');
      container.onclick = function () {
        const l = document.getElementById('l_aud');
        if (l && l.firstChild) l.firstChild.click();
      };
      container.className = 'top_nav_btn';
      container.style.cssText = `
        display: inline-block;
        position: relative;
        width: 30px !important;
        height: 42px;
        cursor: pointer;
        padding: 0 8px !important;
      `;
      container.id = HEADER_VISUALIZER_CONTAINER_ID;
      // Insert before the host node (same visual spot as original)
      if (parent.parentNode) parent.parentNode.insertBefore(container, parent);
      return container;
    }
  },

  {
    name: 'main-player',
    hostSelector: '#content ._audio_page_layout', // main audio page layout
    targetSelector: '#content ._audio_page_layout div[class*="AudioPlayerBlockSectionsLayout__root"] div[class*="AudioPlayerPlaybackBody__audioInfo"]',
    filterMount(node) {
      const sel = this.targetSelector;
      const element = (node.matches && node.matches(sel)) ? node : node.querySelector && node.querySelector(sel);
      return !!element && !document.getElementById(MAIN_PLAYER_CONTAINER_ID);
    },
    filterUnmount(/* addedContainer */) {
      // keep main player until major audio layout is gone
      return !document.querySelector('#content .AudioPlayerBlock__root') && !document.querySelector('#content ._audio_page_layout');
    },
    createContainer(node) {
      const element = (node.matches && node.matches(this.targetSelector)) ? node : node.querySelector && node.querySelector(this.targetSelector);
      const container = document.createElement('div');
      container.id = MAIN_PLAYER_CONTAINER_ID;
      const classList = ['vkuiGroup--mode-card', 'vkuiGroup__modeCard', 'vkuiInternalGroup--mode-card'];
      container.classList.add(...classList);
      container.style.cssText = 'position: relative; margin-top: 16px; overflow:hidden; z-index: 1;';

      const block = document.querySelector('#content ._audio_page_layout .AudioPlayerBlock__root .vkui__root, #content ._audio_page_layout .AudioPlayerBlock__root');
      const style = document.createElement('style');
      style.textContent = `${classList.map(item => '.' + item).join('')}:empty {
        margin: 0px!important;
      }
      .top_audio_player_title, .audio_page_layout .vkui__root div > div > div:nth-child(2) span.vkuiTypography, .audio_page_layout .vkui__root div > div > div:nth-child(2) span.vkuiTypography span{
        user-select:auto!important;
        -webkit-user-select: auto!important;
        -moz-user-select: initial!important;
        -ms-user-select: initial!important;
      }`;

      if (block) {
        block.appendChild(style);
        block.insertBefore(container, block.firstChild);
      } else {
        // fallback: try insert near the element's closest vkui__root
        const rootBlock = element && element.closest && element.closest('.vkui__root');
        if (rootBlock) rootBlock.insertBefore(container, rootBlock.firstChild);
      }
      return container;
    }
  },

  {
    name: 'top-player',
    hostSelector: '#top_audio_layer_place', // top audio layer place is anchor
    targetSelector: '.audio_layer_container div[class*="AudioPlayerBlockSectionsLayout__root"]',
    filterMount(node) {
      const sel = this.targetSelector;
      const element = (node.matches && node.matches(sel)) ? node : node.querySelector && node.querySelector(sel);
      // additionally require compact layout ancestor (same logic as before)
      return element && !document.getElementById(HEADER_PLAYER_CONTAINER_ID) && element.closest && element.closest('div[class*="AudioPlayerBlockCompactLayout__root"]');
    },
    filterUnmount(/* addedContainer */) {
      // unmount when top audio layer place not present
      return !document.querySelector(this.hostSelector);
    },
    createContainer(node) {
      const element = (node.matches && node.matches(this.targetSelector)) ? node : node.querySelector && node.querySelector(this.targetSelector);
      if (!element) return null;
      const audioLayer = element.closest && element.closest('.audio_layer_container');
      const container = document.createElement('div');
      container.id = HEADER_PLAYER_CONTAINER_ID;
      container.style.cssText = 'position: relative; overflow:hidden; z-index: 1;';

      const style = document.createElement('style');
      style.textContent = `.ui_scroll_bar_container { top: calc(64px + 180px)!important }`;
      container.appendChild(style);

      // adjust ui_scroll_container when attribute height changes (borrowed from your logic)
      try {
        const elContainer = audioLayer ? audioLayer.querySelector('.AudioPlayerBlock__root') : null;
        const uiScrollContainer = audioLayer ? audioLayer.querySelector('.audio_page_content_block_wrap.ui_scroll_container') : null;
        if (uiScrollContainer) {
          const attrObserver = new MutationObserver(mutations => {
            try {
              const oldValue = mutations?.[0]?.oldValue;
              if (oldValue) {
                const oldHeightStr = CSSToObject(oldValue)?.height;
                if (oldHeightStr && uiScrollContainer && !uiScrollContainer.style.maxHeight) {
                  const newHeightStr = (Number.parseFloat(oldHeightStr) - 180) + 'px';
                  uiScrollContainer.style.height = newHeightStr;
                  uiScrollContainer.style.maxHeight = newHeightStr;
                }
              }
            } catch (e) { console.debug('uiScroll adjust failed', e); }
          });
          attrObserver.observe(uiScrollContainer, { attributes: true, attributeOldValue: true });
        }
        if (elContainer) elContainer.insertBefore(container, elContainer.firstChild);
        else if (audioLayer && audioLayer.firstChild) audioLayer.insertBefore(container, audioLayer.firstChild);
      } catch (e) { console.debug('top-player create failed', e); }

      return container;
    }
  },

  {
    name: 'panel-buttons',
    hostSelector: '#content .AudioPlayerBlock__root',
    targetSelector: '#content div[class*="AudioPlayerUserControlsContainer__userButtonsContainer"]',
    filterMount(node) {
      const sel = this.targetSelector;
      const element = (node.matches && node.matches(sel)) ? node : node.querySelector && node.querySelector(sel);
      return !!element && !document.getElementById(PANEL_BUTTONS_CONTAINER_ID);
    },
    filterUnmount(/* addedContainer */) {
      return !document.querySelector('#content .AudioPlayerBlock__root') && !document.querySelector('#content ._audio_page_layout');
    },
    createContainer(node) {
      const element = (node.matches && node.matches(this.targetSelector)) ? node : node.querySelector && node.querySelector(this.targetSelector);
      if (!element) return null;
      const container = document.createElement('div');
      container.id = PANEL_BUTTONS_CONTAINER_ID;
 
      container.style.cssText = `
        float: left;
        position: relative;
        padding-right: 12px;
      `;
      // try to find slider parent's content sibling (replicate your previous traversal safely)
      try {
        const slider = document.querySelector('#content [aria-valuemin="0"][role="slider"]');
        if (slider) {
          let elContainer = slider.parentElement;
          for (let i = 0; i < 3 && elContainer; i++) elContainer = elContainer.parentElement;

          if (elContainer) {
            const contentChild = [...(elContainer.children || [])].find(item => item.className && item.className.includes('content'));
            const firstChild = contentChild && contentChild.firstChild;
            console.log('showTooltip', globalThis?.tooltips?.show);
            const siblingElement = firstChild ? firstChild.querySelector('button') : null;
            setVkTooltip({container,text:'VK Blue', fromSibling:true, siblingElement});
          }
        }
      } catch (e) { console.debug('panel-buttons tooltip setup failed', e); }

      element.insertBefore(container, element.firstChild);
      return container;
    }
  },

  {
    name: 'lastfm-buttons',
    hostSelector: '#content .AudioPlayerBlock__root',
    targetSelector: '#content div[class*="AudioPlayerVolumeSlider__bar"], #content div[class*="AudioPlayerPlaybackBody__audioButtons"]',
    filterMount(node) {
      const sel = this.targetSelector;
      const element = (node.matches && node.matches(sel)) ? node : node.querySelector && node.querySelector(sel);
      return !!element && !document.getElementById(LAST_FM_BUTTONS_CONTAINER_ID);
    },
    filterUnmount(/* addedContainer */) {
      return !document.querySelector('#content .AudioPlayerBlock__root') && !document.querySelector('#content ._audio_page_layout');
    },
    createContainer(node) {
      const element = (node.matches && node.matches(this.targetSelector)) ? node : node.querySelector && node.querySelector(this.targetSelector);
      if (!element) return null;
      const container = document.createElement('div');
      container.id = LAST_FM_BUTTONS_CONTAINER_ID;
      container.style.cssText = `
        width: 24px;
        height: 24px;
        overflow: visible;
        margin-right: 8px;
      `;

      // attempt to append to sensible sibling (mirrors your original safe traversal)
      try {
        // find the slider and then the content sibling
        const slider = document.querySelector('#content [aria-valuemin="0"][role="slider"]');
        if (slider) {
          let elContainer = slider.parentElement;
          for (let i = 0; i < 3 && elContainer; i++) elContainer = elContainer.parentElement;
          if (elContainer) {
            const contentChild = [...(elContainer.children || [])].find(item => item.className && item.className.includes('content'));
            const firstChild = contentChild && contentChild.firstChild;
            const siblingElement = firstChild ? firstChild.querySelector('button') : null;
            console.log('siblingElement', siblingElement);
            if (siblingElement) setVkTooltip({container, text:'Last.fm', fromSibling:true, siblingElement});
            // append to elContainer's first child area if present
            // if (contentChild){
            //   contentChild.appendChild(container);
            // } else{
              element.appendChild(container);
            //}
            
          } else {
            element.appendChild(container);
          }
        } else {
          element.appendChild(container);
        }
      } catch (e) {
        try { element.appendChild(container); } catch (er) { console.debug('lastfm fallback append failed', er); }
      }

      return container;
    }
  }
];

/* DOMObservers class */
class DOMObservers {
  constructor() {
    this.added = {};     // name -> container element
    this.removed = {};   // name -> last removed container
    this.pendingRemovals = new Map(); // name -> timeoutId
    this.addCallbacks = [];
    this.removeCallbacks = [];

    // bind
    this.onAdd = this.onAdd.bind(this);
    this.onRemove = this.onRemove.bind(this);

    // initial bootstrap scan (grab existing nodes)
    this.bootstrapExisting();

    // start mutation observer (listening to document subtree additions/removals)
    this.observer = new MutationObserver(mutations => {
      // Process added nodes first (fast path)
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(node => {
            this.handleAddedNode(node);
          });
        }
        if (m.removedNodes && m.removedNodes.length) {
          // we won't rely solely on removedNodes since they can miss re-parenting;
          // instead, we'll run unmount checks for each observer after processing adds.
        }
      }
      // After processing adds, evaluate possible unmounts (stabilized)
      OBSERVERS.forEach(obs => {
        try {
          if (!this.added[obs.name]) return; // nothing mounted
          if (!obs.filterUnmount(this.added[obs.name])) {
            // still present logically
            return;
          }
          // schedule stabilized removal if not already pending
          if (!this.pendingRemovals.has(obs.name)) {
            const tid = setTimeout(() => {
              // verify again
              try {
                if (obs.filterUnmount(this.added[obs.name])) {
                  const container = this.added[obs.name];
                  this.removed[obs.name] = container;
                  this.added[obs.name] = null;
                  this.removeCallbacks.forEach(({ name, callback }) => {
                    if (name === obs.name) callback(container);
                  });
                }
              } catch (e) {
                console.debug('error during stabilized removal', e);
              } finally {
                this.pendingRemovals.delete(obs.name);
              }
            }, UNMOUNT_STABILIZE_MS);
            this.pendingRemovals.set(obs.name, tid);
          }
        } catch (err) {
          console.debug('unmount-eval failed for', obs.name, err);
        }
      });
    });

    // Observe whole document for structural changes
    try {
      this.observer.observe(document, { childList: true, subtree: true, attributes: false });
    } catch (e) {
      console.warn('DOMObservers: cannot observe document yet', e);
      // If document not ready, try again a bit later
      setTimeout(() => {
        try { this.observer.observe(document, { childList: true, subtree: true, attributes: false }); }
        catch (err) { console.warn('DOMObservers observe retry failed', err); }
      }, 500);
    }
  }

  /* bootstrapExisting: scan for existing target nodes and create containers immediately */
  bootstrapExisting() {
    try {
      OBSERVERS.forEach(obs => {
        // do a conservative query for targetSelector; it may be a comma-separated list
        const targets = document.querySelectorAll(obs.targetSelector);
        for (const node of targets) {
          if (this.added[obs.name]) break;
          try {
            if (obs.filterMount(node)) {
              const container = obs.createContainer(node);
              if (container) {
                this.added[obs.name] = container;
                this.removed[obs.name] = null;
                this.addCallbacks.forEach(({ name, callback }) => { if (name === obs.name) callback(container); });
              }
            }
          } catch (e) { console.debug('bootstrap create failed for', obs.name, e); }
        }
      });
    } catch (e) {
      console.debug('bootstrapExisting failed', e);
    }
  }

  /* handleAddedNode: invoked for every added node from MutationObserver */
  handleAddedNode(node) {
    // Skip text nodes
    if (!node || node.nodeType !== 1) return;
    OBSERVERS.forEach(obs => {
      try {
        if (this.added[obs.name]) return; // already added
        if (!obs.filterMount(node)) return;
        const container = obs.createContainer(node);
        if (!container) return;
        this.added[obs.name] = container;
        this.removed[obs.name] = null;
        // if there was a pending removal scheduled, cancel it (we're back)
        if (this.pendingRemovals.has(obs.name)) {
          clearTimeout(this.pendingRemovals.get(obs.name));
          this.pendingRemovals.delete(obs.name);
        }
        this.addCallbacks.forEach(({ name, callback }) => { if (name === obs.name) callback(container); });
      } catch (err) {
        console.debug('handleAddedNode error for', obs.name, err);
      }
    });
  }

  /* Public API: onAdd/onRemove */
  onAdd(name, callback) {
    if (this.added[name]) {
      try { callback(this.added[name]); } catch (e) { console.debug('onAdd callback error', e); }
    }
    this.addCallbacks.push({ name, callback });
  }

  onRemove(name, callback) {
    if (this.removed[name]) {
      try { callback(this.removed[name]); } catch (e) { console.debug('onRemove callback error', e); }
    }
    this.removeCallbacks.push({ name, callback });
  }

  /* Optional: stop observing and cleanup */
  destroy() {
    try {
      this.observer.disconnect();
    } catch (e) { /* no-op */ }
    for (const t of this.pendingRemovals.values()) clearTimeout(t);
    this.pendingRemovals.clear();
    // leave added containers in DOM; caller can remove if desired
  }
}

/* Export a single instance */
export const places = new DOMObservers();

/* For debugging convenience (optional) */
if (typeof window !== 'undefined') {
  window.__blue_places_debug = {
    ids: {
      HEADER_VISUALIZER_CONTAINER_ID,
      MAIN_PLAYER_CONTAINER_ID,
      HEADER_PLAYER_CONTAINER_ID,
      PANEL_BUTTONS_CONTAINER_ID,
      LAST_FM_BUTTONS_CONTAINER_ID
    },
    OBSERVERS
  };
}
