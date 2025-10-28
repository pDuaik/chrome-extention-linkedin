// ===== Scoped, boring, and reliable =====
// Only acts on /feed. Deletes exactly the feed scroller.
// Handles: hard reloads, SPA nav via history, and navbar swaps that don't change URL.

const FEED_SELECTOR = '.scaffold-finite-scroll.scaffold-finite-scroll--infinite';
const FEED_PARENTS = [
  'div[data-test-app-selector="feed"]',
  '#feed-container',
  'main .feed-outlet'
];

let lastPath = location.pathname;
let observer = null;
let pollTimer = null;
let stopTimer = null;

/* Utils */
function isFeedRoute() {
  return location.pathname === '/feed' || location.pathname === '/feed/';
}

function findFeedParent() {
  for (const sel of FEED_PARENTS) {
    try {
      const p = document.querySelector(sel);
      if (p) return p;
    } catch {}
  }
  return null;
}

function deleteFeedOnce() {
  if (!isFeedRoute()) return false;

  // Only consider elements that live under a recognised feed parent
  const parent = findFeedParent();
  if (!parent) return false;

  let removed = false;
  parent.querySelectorAll(FEED_SELECTOR).forEach(el => {
    el.remove();
    removed = true;
  });
  if (removed) console.log('[LI Feed Terminator] feed removed');
  return removed;
}

/* A short burst to catch late hydration, then we stop. */
function startBurst({ delayMs = 500, durationMs = 5000, intervalMs = 120 } = {}) {
  clearBurst();
  const startAt = Date.now() + delayMs;

  pollTimer = setInterval(() => {
    if (!isFeedRoute()) return;
    if (Date.now() < startAt) return;
    deleteFeedOnce();
  }, intervalMs);

  stopTimer = setTimeout(clearBurst, delayMs + durationMs);
}

function clearBurst() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
}

/* Minimal, scoped observer:
   - only attached on /feed
   - only watches the feed parent subtree
   - disconnects when leaving /feed
*/
function ensureObserver() {
  if (!isFeedRoute()) { disconnectObserver(); return; }
  const parent = findFeedParent();
  if (!parent) return;

  if (observer) return;

  observer = new MutationObserver(() => {
    if (!isFeedRoute()) return;
    // If the feed respawns under the feed parent, delete it again.
    deleteFeedOnce();
  });
  observer.observe(parent, { childList: true, subtree: true });
}

function disconnectObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

/* Apply once for the current state */
function applyNow(reason) {
  // console.debug('[LI Feed Terminator] apply:', reason, location.pathname);
  if (!isFeedRoute()) {
    clearBurst();
    disconnectObserver();
    return;
  }
  // Try now, then keep trying briefly, then rely on the scoped observer
  deleteFeedOnce();
  startBurst({ delayMs: 400, durationMs: 6000, intervalMs: 100 });
  ensureObserver();
}

/* Hook true page loads */
window.addEventListener('load', () => applyNow('load'));

/* Hook SPA nav via history */
const _ps = history.pushState;
const _rs = history.replaceState;

function onNav() {
  setTimeout(() => {
    const path = location.pathname;
    const changed = path !== lastPath;
    lastPath = path;
    if (changed) {
      clearBurst();
      disconnectObserver();
      applyNow('history-nav');
    } else {
      // Some navbar clicks re-render without path change
      applyNow('same-path-refresh');
    }
  }, 200);
}

history.pushState = function () { _ps.apply(this, arguments); onNav(); };
history.replaceState = function () { _rs.apply(this, arguments); onNav(); };
window.addEventListener('popstate', onNav);

/* Fallback: URL poll in case LinkedIn sidesteps history handlers */
setInterval(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    clearBurst();
    disconnectObserver();
    applyNow('url-poll');
  }
}, 800);

/* Also react when the tab becomes visible again (LinkedIn can rehydrate) */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') applyNow('visible');
});

/* First immediate attempt for fast loads */
applyNow('immediate');
