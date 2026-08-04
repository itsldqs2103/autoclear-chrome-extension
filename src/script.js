const STORAGE_KEY = 'autoClearUserSettings';
const DEFAULT_SETTINGS = {
  enabled: true,
  clearTypes: {
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
};

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const saved = result[STORAGE_KEY] || {};
      resolve({
        enabled: saved.enabled ?? DEFAULT_SETTINGS.enabled,
        clearTypes: {
          ...DEFAULT_SETTINGS.clearTypes,
          ...(saved.clearTypes || {}),
        },
      });
    });
  });
}

function buildClearOptions(settings) {
  const clearTypes = settings.clearTypes || DEFAULT_SETTINGS.clearTypes;
  const options = {};

  Object.keys(clearTypes).forEach((key) => {
    if (clearTypes[key]) {
      options[key] = true;
    }
  });

  return options;
}

function clearBrowsingData() {
  getSettings().then((settings) => {
    if (!settings.enabled) {
      return;
    }

    chrome.browsingData.remove({}, buildClearOptions(settings));
  });
}

chrome.runtime.onStartup.addListener(clearBrowsingData);
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    if (!result[STORAGE_KEY]) {
      chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
    }
  });
});
