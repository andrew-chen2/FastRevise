document.addEventListener("DOMContentLoaded", () => {
  const autoRetry = document.getElementById("autoRetry");
  const autoContinue = document.getElementById("autoContinue");
  const idkBtnToggle = document.getElementById("idkBtn");
  const masteryPopover = document.getElementById("masteryPopover");

  // Load saved settings
  chrome.storage.sync.get(
    ["autoRetry", "autoContinue", "idkBtn", "masteryPopover"],
    (result) => {
      autoRetry.checked = result.autoRetry ?? true;
      autoContinue.checked = result.autoContinue ?? true;
      idkBtnToggle.checked = result.idkBtn ?? true;
      masteryPopover.checked = result.masteryPopover ?? true;
    },
  );

  // Save settings
  const checkboxes = document.querySelectorAll("input[type=checkbox]");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      chrome.storage.sync.set({ [checkbox.id]: checkbox.checked });
    });
  });
});
