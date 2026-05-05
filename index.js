console.log("FastRevise loaded.");

let answerId = null;
let timestamp = Date.now();
const COOLDOWN = 3000;

// Anti-freeze (for rvsGlobal)
window.rvsGlobal = window.rvsGlobal || {};
Object.defineProperty(window.rvsGlobal, "freezeNamespaces", {
  get: function () {
    return function () {};
  },
  set: function (value) {},
  configurable: true,
});

// Answer click tracker
document.addEventListener(
  "click",
  function (event) {
    const button = event.target.closest(".js_answerButton");
    if (button) {
      answerId = button.getAttribute("data-answerid");
    }
  },
  true,
);

// Wrap original AJAX function for timing requests
const stopwatchInterval = setInterval(() => {
  if (
    window.rvsGlobal &&
    window.rvsGlobal.ajax &&
    window.rvsGlobal.ajax.postAndRespond
  ) {
    clearInterval(stopwatchInterval);

    const originalPost = window.rvsGlobal.ajax.postAndRespond;

    window.rvsGlobal.ajax.postAndRespond = function (
      url,
      data,
      token,
      successCb,
      errorCb,
    ) {
      const wrappedSuccessCb = function (response) {
        // Save timestamp if no repost error
        if (!response || response.error !== "Repost") {
          timestamp = Date.now();
        }

        // Pass the response to the website normally
        successCb(response);

        // Auto click "Next Question" button
        if (
          document.documentElement.dataset.autoContinue !== "false" &&
          response.previousAnswerId === response.previousCorrectAnswerId &&
          response.error !== "Repost"
        ) {
          document.getElementById("lnkNext")?.click();
        }
      };

      originalPost.call(this, url, data, token, wrappedSuccessCb, errorCb);
    };
  }
}, 100);

// Hide popup and auto resubmit
const modifySwal = setInterval(() => {
  if (window.Swal && window.Swal.fire) {
    clearInterval(modifySwal);

    const originalSwal = window.Swal.fire;

    window.Swal.fire = function (args) {
      if (
        args &&
        args.title === "Slow down!" &&
        document.documentElement.dataset.autoRetry !== "false"
      ) {
        const elapsed = Date.now() - timestamp;
        let waitTime = COOLDOWN - elapsed;
        waitTime = Math.max(10, waitTime); // In case it goes negative

        console.log(
          `Too fast! Elapsed: ${elapsed}ms. Waiting remaining ${waitTime}ms...`,
        );

        // Disable answer buttons
        document.body.classList.add("disable-answers");

        setTimeout(() => {
          // Re-enable answer buttons
          document.body.classList.remove("disable-answers");

          if (answerId) {
            const retryBtn = document.querySelector(
              `a[data-answerid="${answerId}"]`,
            );
            if (retryBtn) retryBtn.click();
          }
        }, waitTime);

        window.rvsGlobal.fn.unblock("#answercontainer");

        // Close the popup
        return Promise.resolve({ isConfirmed: true });
      }

      // Let other popups work normally
      return originalSwal.apply(this, arguments);
    };
  }
}, 100);

document.addEventListener("keydown", (event) => {
  if (
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    ["INPUT", "TEXTAREA"].includes(event.target.tagName) ||
    document.body.classList.contains("disable-answers")
  )
    return;

  if (
    event.key == " " &&
    document.documentElement.dataset.keyboardShortcuts !== "false"
  ) {
    document.getElementById("lnkNext")?.click();
  }

  if (
    ["1", "2", "3", "4"].includes(event.key) &&
    document.documentElement.dataset.keyboardShortcuts !== "false"
  ) {
    const buttons = Array.from(
      document.querySelectorAll(".js_answerButton"),
    ).filter((btn) => btn.getAttribute("data-answerid") !== "-1");

    const index = parseInt(event.key) - 1;

    if (buttons[index]) {
      buttons[index].click();
    }
  }
});
