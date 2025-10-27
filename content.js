// If you want to be aggressive, nuke anything that looks like the feed, repeatedly.
// This handles infinite-scroll and LinkedIn’s habit of reattaching the feed.
const selectors = [
  '#feed-container',
  '.scaffold-finite-scroll',
  'div[data-test-app-selector="feed"]',
  'main div.feed-outlet',
  'div[data-view-name="feed-container"]'
];

function hideFeed() {
  let killed = false;
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach(el => {
      el.style.display = 'none';
      el.setAttribute('data-li-muzzled', '1');
      killed = true;
    });
  }
  return killed;
}

// Run once after DOM is idle
hideFeed();

// Keep swatting as the DOM mutates
const mo = new MutationObserver(() => hideFeed());
mo.observe(document.documentElement, { childList: true, subtree: true });

// Optional: if you land directly on /feed, shove the user somewhere useful
if (location.pathname === '/feed/') {
  // Comment out the next line if you prefer to stay on /feed with everything hidden
  // location.replace('/mynetwork/');
}
