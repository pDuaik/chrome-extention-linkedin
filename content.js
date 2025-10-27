// ==== LinkedIn Feed Toggle + SPA-proof nuker (defensive build) ====

const FEED_SELECTOR = '.scaffold-finite-scroll.scaffold-finite-scroll--infinite';

let enabled = true;                 // cached toggle
let lastPath = location.pathname;
let burstInterval = null;
let burstDeadline = 0;

// Safe guards for chrome APIs
const hasChrome = typeof chrome !== 'undefined' && chrome && typeof chrome === 'object';
const hasStorage = hasChrome && chrome.storage && chrome.storage.sync;

// Helper: get setting with fallback
function getEnabledSetting(cb) {
  if (!hasStorage) {
    console.warn('[LI Feed Toggle] chrome.storage.sync missing; defaulting to enabled=true');
    cb(true);
    return;
  }
  try {
    chrome.storage.sync.get(['feedBlockEnabled'], (data) => {
      // If Chrome throws, catch below
      const v = (data && typeof data.feedBlockEnabled !== 'undefined') ? !!data.feedBlockEnabled : true;
      cb(v);
    });
  } catch (e) {
    console.warn('[LI Feed Toggle] storage.get failed; defaulting to enabled=true', e);
    cb(true);
  }
}

// Init
getEnabledSetting((v) => {
  enabled = v;
  applyNow('init');
});

// Listen for storage changes if available
if (hasStorage && chrome.storage.onChanged && chrome.storage.onChanged.addListener) {
  chrome.storage.onChanged.addListener((changes, area) => {
    try {
      if (area === 'sync' && changes && Object.prototype.hasOwnProperty.call(changes, 'feedBlockEnabled')) {
        enabled = !!changes.feedBlockEnabled.newValue;
        applyNow('storage');
      }
    } catch (e) {
      console.warn('[LI Feed Toggle] storage.onChanged handler error', e);
    }
  });
}

// Also accept direct messages from popup, but only if runtime exists
if (hasChrome && chrome.runtime && chrome.runtime.onMessage && chrome.runtime.onMessage.addListener) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'FEED_TOGGLE_CHANGED') {
      enabled = !!msg.enabled;
      applyNow('message');
    }
  });
}

function onFeedRoute() {
  // /feed or /feed/ (ignore query)
  return location.pathname === '/feed' || location.pathname === '/feed/';
}

function nukeOnce() {
  if (!enabled || !onFeedRoute()) return false;
  let removed = false;
  document.querySelectorAll(FEED_SELECTOR).forEach(el => {
    el.remove();
    removed = true;
  });
  if (removed) console.log('[LI Feed Toggle] feed removed');
  return removed;
}

// Short aggressive burst to catch late-mounting DOM
function startBurst(ms = 7000, everyMs = 100) {
  clearBurst();
  burstDeadline = (typeof performance !== 'undefined' && performance.now) ? performance.now() + ms : Date.now() + ms;
  burstInterval = setInterval(() => {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
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

function applyNow(_reason) {
  clearBurst();
  if (!enabled) return;
  if (!onFeedRoute()) return;
  nukeOnce();
  startBurst(7000, 100);
}

// Observe DOM to swat respawns
try {
  const mo = new MutationObserver(() => {
    if (!enabled || !onFeedRoute()) return;
    nukeOnce();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
} catch (e) {
  console.warn('[LI Feed Toggle] MutationObserver failed', e);
}

// Hook SPA navigation
(function hookHistory() {
  try {
    const _ps = history.pushState;
    const _rs = history.replaceState;
    function onNav() {
      setTimeout(() => {
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
  } catch (e) {
    console.warn('[LI Feed Toggle] History hook failed', e);
  }
})();

// Fallback URL poll (in case LinkedIn sidesteps history)
setInterval(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    applyNow('poll');
  }
}, 1000);

// First DOM ready pass
document.addEventListener('DOMContentLoaded', () => applyNow('domready'));
