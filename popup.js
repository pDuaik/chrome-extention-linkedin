const toggle = document.getElementById('toggleFeed');

// Load current value
chrome.storage.sync.get({ feedBlockEnabled: true }, ({ feedBlockEnabled }) => {
  toggle.checked = !!feedBlockEnabled;
});

// Persist + notify the active tab immediately
function notifyActiveTab(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    // Fire-and-forget; content script will ignore if not on linkedin.com
    chrome.tabs.sendMessage(tab.id, { type: 'FEED_TOGGLE_CHANGED', enabled });
  });
}

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ feedBlockEnabled: enabled }, () => {
    notifyActiveTab(enabled);
  });
});
