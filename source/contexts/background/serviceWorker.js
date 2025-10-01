import browser from 'webextension-polyfill';
import 'webextension-polyfill/dist/browser-polyfill.min.js';

console.log('serviceWorker script loaded');

try {
  /* eslint-disable no-undef */
  if ('function' === typeof ((self).importScripts)) {
    (self).importScripts("background.js");
  }
} catch (e) {
  console.error(e);
}


// ---------------------------------------------------------------------------
// https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
// https://github.com/radiolondra/ServiceWorker-Highlander-DNA
// serviceworker.js — improved Highlander keep-alive module
// Leave `persistent` var for your external control
let persistent = true;

if (persistent) {
  // Config
  const INTERNAL_TESTALIVE_PORT = "DNA_Internal_alive_test";
  const START_FAST_MS = 300;            // quick initial ping interval
  const NORMAL_PERIOD_MINUTES = 1;      // chrome.alarms.periodInMinutes minimum practical value is 1
  const RECONNECT_MAX_ATTEMPTS = 6;     // exponential backoff cap
  const RECONNECT_BASE_MS = 1000;       // 1s base for backoff
  const DEBUG = false;

  // State
  let alivePort = null;
  let isFirstStart = true;
  let isAlreadyAwake = false;
  let firstCall = null;
  let lastCall = null;
  let reconnectAttempts = 0;
  let fastTimerId = undefined;

  // Helper: short time HH:MM:SS
  function convertNoDate(long) {
    const dt = new Date(long).toISOString();
    return dt.slice(-13, -5);
  }

  // MAIN
  if (persistent) {
    console.log(`-------- >>> ${convertNoDate(Date.now())} UTC - Service Worker HIGHLANDER (improved) starting <<< --------`);
    startup();
  } else {
    // Nothing runs until persistent = true
    if (DEBUG) console.log("Highlander disabled by persistent=false");
  }

  // ------------------------ startup / init ------------------------
  function startup() {
    // fast initial loop to "wake up" quickly, then switch to alarms
    if (!isAlreadyAwake) {
      startFastLoop();
    }

    // wire chrome events
    browser.runtime.onInstalled.addListener(async () => {
      await onInstalledInitialize();
    });

    // alarms wake the service worker periodically even when suspended
    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm && alarm.name === "highlander") {
        Highlander();
      }
    });

    // keep an eye on windows so we can stop trying to be immortal when browser is closing
    browser.windows.onRemoved.addListener(onWindowRemoved);
    browser.windows.onCreated.addListener(onWindowCreated);

    // lightweight tab listeners for diagnostics (no external changes needed)
    browser.tabs.onCreated.addListener((tab) => { if (DEBUG) console.log("tab created", tab.id); });
    browser.tabs.onRemoved.addListener((id) => { if (DEBUG) console.log("tab removed", id); });
    browser.tabs.onUpdated.addListener((id, info) => { if (DEBUG) console.log("tab updated", id, info.status || info); });

    // Create the periodic alarm (ensures worker wakes every NORMAL_PERIOD_MINUTES)
    try {
      browser.alarms.create("highlander", { periodInMinutes: NORMAL_PERIOD_MINUTES });
      if (DEBUG) console.log("Highlander alarm created with periodInMinutes=", NORMAL_PERIOD_MINUTES);
    } catch (e) {
      console.warn("Failed to create alarm (maybe permissions/manifest). Highlander will still try using timers.", e);
    }
  }

  // Called on install/start to check tabs/windows state
  async function onInstalledInitialize() {
    await checkTabs();
    // ensure wake-up
    if (!isAlreadyAwake) startFastLoop();
  }

  // ------------------------ windows handlers ------------------------
  let wCounter = 0;
  async function onWindowCreated() {
    try {
      const all = await browser.windows.getAll();
      wCounter = all.length;
    } catch (e) {
      // fallback: increment
      wCounter++;
    }
    // If this is the first window and we were not awake, ensure jobs
    if (wCounter === 1) {
      if (!isAlreadyAwake) startFastLoop();
      // ensure alarm exists
      try { browser.alarms.create("highlander", { periodInMinutes: NORMAL_PERIOD_MINUTES }); } catch (_) { }
    }
  }

  function onWindowRemoved() {
    wCounter = Math.max(0, wCounter - 1);
    // If browser is closing (no windows), allow shutdown (stop fast loop, keep alarm if you want)
    if (wCounter === 0) {
      // stop fast loop if present
      if (fastTimerId !== undefined) {
        clearInterval(fastTimerId);
        fastTimerId = undefined;
      }
      // We intentionally DO NOT remove the chrome.alarms alarm: alarms will wake SW later.
      // But we should close any local keepalive Port so the runtime can unload the worker faster.
      if (alivePort) {
        try { alivePort.disconnect(); } catch (_) { }
        alivePort = null;
      }
      isAlreadyAwake = false;
      if (DEBUG) console.log("No windows: Highlander relaxed. Alarms remain to wake SW periodically.");
    }
  }

  // ------------------------ tab check ------------------------
  async function checkTabs() {
    try {
      const tabs = await browser.tabs.query({});
      tabs.forEach(t => { if (DEBUG) console.log("existing tab", t.id); });
    } catch (e) {
      if (DEBUG) console.warn("tabs.query failed", e);
    }
  }

  // ------------------------ fast loop and normal transition ------------------------
  function startFastLoop() {
    if (isAlreadyAwake) return;
    isFirstStart = true;
    isAlreadyAwake = true;
    firstCall = Date.now();
    lastCall = firstCall;
    reconnectAttempts = 0;
    // Fast interval until we transition to alarms: run Highlander frequently for quick init
    if (fastTimerId === undefined) {
      Highlander(); // immediate
      fastTimerId = setInterval(Highlander, START_FAST_MS);
      if (DEBUG) console.log(`Highlander fast loop started (ms=${START_FAST_MS})`);
      // plan to stop fast loop shortly (we will stay on alarms afterwards)
      setTimeout(() => {
        if (fastTimerId !== undefined) {
          clearInterval(fastTimerId);
          fastTimerId = undefined;
          if (DEBUG) console.log("Highlander fast loop stopped; relying on alarms now.");
        }
      }, 5000); // 5 seconds of fast attempts (tunable)
    }
  }

  // ------------------------ Highlander (heartbeat) ------------------------
  function Highlander() {
    const now = Date.now();
    if (!firstCall) firstCall = now;
    lastCall = now;
    const age = now - firstCall;
    if (DEBUG) console.log(`HIGHLANDER ping @ ${convertNoDate(now)} (uptime ms=${age})`);

    ensurePortConnected().then(() => {
      // If port is connected, send a lightweight ping
      if (alivePort) {
        try {
          alivePort.postMessage({ content: "ping", ts: now });
          if (DEBUG) console.log("(H) ping posted");
        } catch (e) {
          if (DEBUG) console.warn("(H) postMessage failed", e);
        }
      }
    }).catch((e) => {
      if (DEBUG) console.warn("ensurePortConnected failed", e);
    });
  }

  // ------------------------ port lifecycle + reconnect ------------------------
  async function ensurePortConnected() {
    if (alivePort) return;

    try {
      alivePort = browser.runtime.connect({ name: INTERNAL_TESTALIVE_PORT });
    } catch (e) {
      alivePort = null;
      if (DEBUG) console.warn("runtime.connect threw", e);
      scheduleReconnect();
      return;
    }

    if (!alivePort) {
      scheduleReconnect();
      return;
    }

    reconnectAttempts = 0;

    alivePort.onMessage.addListener((msg) => {
      if (DEBUG) console.log("alivePort received:", msg);
    });

    alivePort.onDisconnect.addListener(() => {
      const err = chrome.runtime.lastError;
      if (err && DEBUG) console.warn("alivePort disconnected:", err.message);
      alivePort = null;
      scheduleReconnect();
    });
  }

  browser.runtime.onConnect.addListener((port) => {
    if (port.name === INTERNAL_TESTALIVE_PORT) {
      if (DEBUG) console.log("Highlander port connected:", port.name);

      port.onMessage.addListener((msg) => {
        if (DEBUG) console.log("Highlander ping:", msg);
        try { port.postMessage({ pong: Date.now() }); } catch (_) { }
      });

      port.onDisconnect.addListener(() => {
        if (DEBUG) console.log("Highlander port disconnected");
      });
    }
  });

  function scheduleReconnect() {
    if (reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) {
      if (DEBUG) console.warn("Max reconnect attempts reached, will rely on alarms to wake SW.");
      return;
    }
    reconnectAttempts++;
    const delay = RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts - 1);
    if (DEBUG) console.log(`Scheduling reconnect attempt #${reconnectAttempts} in ${delay}ms`);
    setTimeout(() => {
      // Only attempt to reconnect if persistent still desired and SW not being unloaded
      if (!persistent) return;
      if (!alivePort) ensurePortConnected();
    }, delay);
  }

  // ------------------------ cleanup on uninstall or shutdown ------------------------
  browser.runtime.onSuspend?.addListener?.(() => {
    // runtime.onSuspend is informative: SW is being suspended; clean local timers
    if (DEBUG) console.log("SW onSuspend: cleaning up timers and ports");
    try { if (fastTimerId) clearInterval(fastTimerId); } catch (_) { }
    if (alivePort) {
      try { alivePort.disconnect(); } catch (_) { }
      alivePort = null;
    }
  });

  // ------------------------ Exports / runtime control (optional) ------------------------
  // Keep these so other parts (or tests) can message this worker to change behavior (no mandatory changes elsewhere)
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.cmd) return;
    switch (message.cmd) {
      case "highlander-status":
        sendResponse({
          alivePort: !!alivePort,
          isAlreadyAwake,
          firstCall,
          lastCall,
          reconnectAttempts
        });
        break;
      case "set-persistent":
        // allow runtime toggling if you later want to control from other UI
        persistent = !!message.value;
        if (persistent && !isAlreadyAwake) startFastLoop();
        if (!persistent && alivePort) {
          try { alivePort.disconnect(); } catch (_) { }
          alivePort = null;
        }
        sendResponse({ ok: true, persistent });
        break;
      default:
        break;
    }
  });
}
// ---------------------------------------------------------------------------