// Load settings
chrome.storage.sync.get(
  [
    "autoRetry",
    "autoContinue",
    "idkBtn",
    "masteryPopover",
    "keyboardShortcuts",
  ],
  (result) => {
    document.documentElement.dataset.autoRetry = result.autoRetry ?? true;
    document.documentElement.dataset.autoContinue = result.autoContinue ?? true;
    document.documentElement.dataset.keyboardShortcuts =
      result.keyboardShortcuts ?? true;
    document.documentElement.dataset.idkBtn = result.idkBtn ?? true;
    document.documentElement.dataset.masteryPopover =
      result.masteryPopover ?? true;
  },
);

// Sync changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    for (let [key, { newValue }] of Object.entries(changes)) {
      document.documentElement.dataset[key] = newValue;
    }
  }
});
