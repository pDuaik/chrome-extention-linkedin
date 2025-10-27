const toggle = document.getElementById('toggleFeed');

// Load saved setting
chrome.storage.sync.get(['feedBlockEnabled'], ({ feedBlockEnabled }) => {
  toggle.checked = feedBlockEnabled ?? true;
});

function notifyActiveTab(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs && tabs[0];
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: 'FEED_TOGGLE_CHANGED', enabled });
  });
}

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ feedBlockEnabled: enabled }, () => {
    // Tell the current tab immediately so you don’t wait for storage propagation
    notifyActiveTab(enabled);
  });
});
