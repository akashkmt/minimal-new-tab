// Save settings
function saveSettings(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

// Load settings
function loadSettings(callback) {
  chrome.storage.sync.get(["theme", "timeFormat", "dateFormat"], callback);
}

function updateDisplay() {
  const now = new Date();

  loadSettings((settings) => {
    // Theme
    const theme = settings.theme || "light";
    document.body.className = theme;
    document.querySelector(".container").className = `container ${theme}`;

    // Time format
    const is24Hour = (settings.timeFormat || "12") === "24";
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !is24Hour,
    };
    document.getElementById("time").textContent = now.toLocaleTimeString(
      "en-US",
      timeOptions
    );

    // Date format
    const dateFormat = settings.dateFormat || "long";
    let dateOptions;
    switch (dateFormat) {
      case "short":
        dateOptions = {
          weekday: "short",
          year: "2-digit",
          month: "short",
          day: "numeric",
        };
        break;
      case "numeric":
        dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
        break;
      default: // long
        dateOptions = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
    }
    document.getElementById("date").textContent = now.toLocaleDateString(
      "en-US",
      dateOptions
    );
  });
}

document.getElementById("theme").addEventListener("change", (e) => {
  saveSettings("theme", e.target.value);
  updateDisplay();
});

document.getElementById("timeFormat").addEventListener("change", (e) => {
  saveSettings("timeFormat", e.target.value);
  updateDisplay();
});

document.getElementById("dateFormat").addEventListener("change", (e) => {
  saveSettings("dateFormat", e.target.value);
  updateDisplay();
});

loadSettings((settings) => {
  document.getElementById("theme").value = settings.theme || "light";
  document.getElementById("timeFormat").value = settings.timeFormat || "12";
  document.getElementById("dateFormat").value = settings.dateFormat || "long";
  updateDisplay();
});

setInterval(updateDisplay, 1000);
