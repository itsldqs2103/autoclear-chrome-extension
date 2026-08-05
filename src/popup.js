import tippy, { animateFill } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "../src/popup.css";
import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";

tippy(".setting-row", {
  placement: "auto",
  animateFill: true,
  plugins: [animateFill],
  maxWidth: "none",
});

const STORAGE_KEY = "autoClearUserSettings";
const CLEARABLE_KEYS = [
  "cache",
  "cacheStorage",
  "cookies",
  "downloads",
  "fileSystems",
  "formData",
  "history",
  "indexedDB",
  "localStorage",
  "passwords",
  "serviceWorkers",
];

const defaultSettings = {
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

let savedSettings = null;

function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const saved = result[STORAGE_KEY] || {};
      const nextSettings = {
        enabled: saved.enabled ?? defaultSettings.enabled,
        clearTypes: {
          ...defaultSettings.clearTypes,
          ...(saved.clearTypes || {}),
        },
      };

      savedSettings = cloneSettings(nextSettings);
      resolve(nextSettings);
    });
  });
}

function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: settings }, () => {
      savedSettings = cloneSettings(settings);
      resolve();
    });
  });
}

function renderSettings(settings) {
  const enabledToggle = document.getElementById("enabledToggle");
  enabledToggle.checked = settings.enabled;

  CLEARABLE_KEYS.forEach((key) => {
    const check = document.querySelector(`[data-option="${key}"]`);
    if (check) {
      check.checked = settings.clearTypes[key];
    }
  });
}

function collectSettings() {
  const settings = {
    enabled: document.getElementById("enabledToggle").checked,
    clearTypes: {},
  };

  CLEARABLE_KEYS.forEach((key) => {
    const check = document.querySelector(`[data-option="${key}"]`);
    settings.clearTypes[key] = Boolean(check && check.checked);
  });

  return settings;
}

function hasPendingChanges() {
  const currentSettings = collectSettings();
  return JSON.stringify(currentSettings) !== JSON.stringify(savedSettings);
}

function updateButtonStates() {
  const undoButton = document.getElementById("undoButton");
  const saveButton = document.getElementById("saveButton");
  const hasChanges = hasPendingChanges();

  undoButton.style.display = hasChanges ? "" : "none";
  saveButton.disabled = !hasChanges;
}

let statusTimeoutId = null;

function setStatus(message, tone = "default") {
  const statusElement = document.getElementById("statusMessage");
  statusElement.textContent = message;
  statusElement.className = `status-text ${tone === "error" ? "error" : tone === "success" ? "success" : ""}`;

  window.clearTimeout(statusTimeoutId);
  statusTimeoutId = window.setTimeout(() => {
    statusElement.textContent = "";
    statusElement.className = "status-text";
  }, 5000);
}

async function initializePopup() {
  const settings = await getSettings();
  renderSettings(settings);
  updateButtonStates();

  const allInputs = document.querySelectorAll('input[type="checkbox"]');
  allInputs.forEach((input) => {
    input.addEventListener("change", () => {
      updateButtonStates();
    });
  });

  document.getElementById("saveButton").addEventListener("click", async () => {
    const nextSettings = collectSettings();
    await saveSettings(nextSettings);
    updateButtonStates();
    setStatus(
      "Settings saved. AutoClear will use your updated preferences on next startup.",
      "success",
    );
  });

  document.getElementById("undoButton").addEventListener("click", () => {
    renderSettings(savedSettings);
    updateButtonStates();
    setStatus("Changes reverted. Last saved settings are restored.", "success");
  });
}

initializePopup().catch(() => {
  setStatus(
    "Unable to load settings right now. Please try reopening the popup.",
    "error",
  );
});
