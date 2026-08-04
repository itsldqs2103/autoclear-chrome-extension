chrome.runtime.onStartup.addListener(() =>
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
  ),
);
