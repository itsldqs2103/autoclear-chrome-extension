function clearBrowsingData() {
  chrome.browsingData.remove(
    {},
    {
      cache: true,
      cacheStorage: true,
      cookies: false,
      downloads: true,
      fileSystems: true,
      formData: true,
      history: true,
      indexedDB: true,
      localStorage: true,
      passwords: true,
      serviceWorkers: true,
    },
  );
}

chrome.runtime.onStartup.addListener(clearBrowsingData);
chrome.action.onClicked.addListener(clearBrowsingData);
