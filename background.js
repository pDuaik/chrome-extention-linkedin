chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['feedBlockEnabled'], ({ feedBlockEnabled }) => {
    if (typeof feedBlockEnabled === 'undefined') {
      chrome.storage.sync.set({ feedBlockEnabled: true });
    }
  });
});
