// ==== LinkedIn Feed Toggle — honours popup on reload and SPA nav ====

const FEED_SELECTOR = '.scaffold-finite-scroll.scaffold-finite-scroll--infinite';

let enabled = true;      // cached toggle
let ready = false;       // don't act until storage is loaded
let lastPath = location.pathname;
let burstInterval = null;
let burstDeadline = 0;

function onFeedRoute() {
  return location.pathname === '/feed' || location.pathname === '/feed/';
}

function nukeOnce() {
  if (!ready || !enabled || !onFeedRoute()) return false;
  let removed = false;
  document.querySelectorAll(FEED_SELECTOR).forEach(el => {
    el.remove();
    removed = true;
  });
  if (removed) console.log('[LI Feed Toggle] feed removed');
  return removed;
}

function startBurst(ms = 6000, everyMs = 100) {
  clearBurst();
  burstDeadline = (performance?.now?.() ?? Date.now()) + ms;
  burstInterval = setInterval(() => {
    const now = performance?.now?.() ?? Date.now();
    if (now > burstDeadline) return clearBurst();
    nukeOnce();
  }, everyMs);
}

function clearBurst() {
  if (burstInterval) {
    clearInterval(burstInterval);
    burstInterval = null;
  }
}

function applyNow(reason) {
  if (!ready) return;           // critical: wait for storage load
  clearBurst();
  if (!enabled) return;         // toggle off → do nothing
  if (!onFeedRoute()) return;   // only act on /feed
  nukeOnce();
  startBurst(7000, 100);
}

// ----- Bootstrap: load toggle state BEFORE wiring any handlers that act -----
chrome.storage.sync.get({ feedBlockEnabled: true }, ({ feedBlockEnabled }) => {
  enabled = !!feedBlockEnabled;
  ready = true;
  applyNow('init');
});

// ----- Live updates from popup/storage -----
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'FEED_TOGGLE_CHANGED') {
    enabled = !!msg.enabled;
    if (!ready) ready = true;   // in case popup talks very early
    applyNow('popup-message');
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.feedBlockEnabled) {
    enabled = !!changes.feedBlockEnabled.newValue;
    if (!ready) ready = true;
    applyNow('storage-change');
  }
});

// ----- DOM respawns -----
const mo = new MutationObserver(() => {
  if (!ready || !enabled || !onFeedRoute()) return;
  nukeOnce();
});
mo.observe(document.documentElement, { childList: true, subtree: true });

// ----- SPA navigation hooks -----
const _ps = history.pushState;
const _rs = history.replaceState;
function onNav() {
  setTimeout(() => {
    if (!ready) return;
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      applyNow('nav');
    } else {
      applyNow('nav-samepath');
    }
  }, 200);
}
history.pushState = function () { _ps.apply(this, arguments); onNav(); };
history.replaceState = function () { _rs.apply(this, arguments); onNav(); };
window.addEventListener('popstate', onNav);

// ----- Fallback URL polling -----
setInterval(() => {
  if (!ready) return;
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    applyNow('poll');
  }
}, 1000);

// No DOMContentLoaded handler here.
// We rely on the storage load callback to mark ready and apply.
