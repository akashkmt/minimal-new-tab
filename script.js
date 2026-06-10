// ── State ─────────────────────────────────────────────────────────────────────

const DEFAULT_LINKS = [
  { label: "GitHub", url: "https://github.com" },
  { label: "Gmail", url: "https://mail.google.com" },
  { label: "YouTube", url: "https://youtube.com" },
];

let state = {
  theme: "system",
  format: "24",
  searchEngine: "https://google.com/search?q=",
  links: DEFAULT_LINKS,
  name: "",
  widgets: ["progress"],
};

function loadState() {
  try {
    const saved = localStorage.getItem("ntp_state");
    if (saved) state = { ...state, ...JSON.parse(saved) };
  } catch (_) {}
}

function saveState() {
  localStorage.setItem("ntp_state", JSON.stringify(state));
}

// ── Theme ──────────────────────────────────────────────────────────────────────

function resolvedTheme() {
  if (state.theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return state.theme;
}

function applyTheme() {
  document.body.dataset.theme = resolvedTheme();
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (state.theme === "system") applyTheme();
});

// ── Clock ──────────────────────────────────────────────────────────────────────

const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  let suffix = "";

  if (state.format === "12") {
    suffix = h >= 12 ? " PM" : " AM";
    h = h % 12 || 12;
  }

  clockEl.textContent = `${String(h).padStart(2, "0")}:${m}${suffix}`;
}

function updateDate() {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

setInterval(updateClock, 1000);
updateClock();
updateDate();

// ── Top Widget ─────────────────────────────────────────────────────────────────

const QUOTES = [
  ["The only way to do great work is to love what you do.", "Steve Jobs"],
  ["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
  ["Focus on what matters.", "Marcus Aurelius"],
  ["Do one thing at a time, and do it well.", "Steve Jobs"],
  ["Small steps every day.", ""],
  ["Clarity is power.", ""],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["Done is better than perfect.", "Sheryl Sandberg"],
  ["Slow is smooth, smooth is fast.", ""],
  ["You don't rise to the level of your goals, you fall to the level of your systems.", "James Clear"],
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["The secret of getting ahead is getting started.", "Mark Twain"],
  ["Hard choices, easy life. Easy choices, hard life.", "Jerzy Gregorek"],
  ["What you do every day matters more than what you do once in a while.", "Gretchen Rubin"],
  ["Perfection is the enemy of progress.", "Winston Churchill"],
  ["Be stubborn on vision, flexible on details.", "Jeff Bezos"],
  ["Everything should be made as simple as possible, but not simpler.", "Albert Einstein"],
  ["The best time to plant a tree was 20 years ago. The second best time is now.", "Chinese Proverb"],
  ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
  ["First, solve the problem. Then, write the code.", "John Johnson"],
  ["The most dangerous kind of waste is the waste we do not recognize.", "Shigeo Shingo"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["An hour of planning can save you ten hours of doing.", "Dale Carnegie"],
  ["Absorb what is useful, discard what is not, add what is uniquely your own.", "Bruce Lee"],
  ["You can't use up creativity. The more you use, the more you have.", "Maya Angelou"],
  ["Motivation gets you started. Habit keeps you going.", "Jim Ryun"],
  ["The quality of your life is the quality of your questions.", "Tony Robbins"],
  ["Either write something worth reading or do something worth writing.", "Benjamin Franklin"],
  ["Energy, not time, is the fundamental currency of high performance.", "Jim Loehr"],
  ["The expert in anything was once a beginner.", "Helen Hayes"],
  ["Don't count the days, make the days count.", "Muhammad Ali"],
  ["Build something 100 people love, not something 1 million people kind of like.", "Paul Graham"],
  ["If you're not embarrassed by the first version, you launched too late.", "Reid Hoffman"],
  ["Strong opinions, loosely held.", "Paul Saffo"],
  ["The goal is not to be better than the other man, but your previous self.", "Dalai Lama"],
  ["Do more of what works and less of what doesn't.", ""],
  ["Discipline is choosing between what you want now and what you want most.", ""],
  ["Start before you're ready.", ""],
  ["Make fewer decisions better.", ""],
  ["Less, but better.", "Dieter Rams"],
];

const topWidgetEl = document.getElementById("topWidget");

function renderWidget(key, now) {
  if (key === "progress") {
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const endOfDay   = new Date(now); endOfDay.setHours(23,59,59,999);
    const pct = Math.round(((now - startOfDay) / (endOfDay - startOfDay)) * 100);
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    return `<div class="widget-progress">
      <div class="wp-bar-wrap"><div class="wp-bar" style="width:${pct}%"></div></div>
      <span class="wp-label">${pct}% through ${dayName}</span>
    </div>`;
  }
  if (key === "quote") {
    const idx = now.getDate() % QUOTES.length;
    const [text, attr] = QUOTES[idx];
    return `<div class="widget-quote">
      <span class="wq-text">"${text}"</span>
      ${attr ? `<span class="wq-attr">— ${attr}</span>` : ""}
    </div>`;
  }
  if (key === "week") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const dayOfWeek = now.getDay();
    const weekPct = Math.round((dayOfWeek === 0 ? 7 : dayOfWeek) / 7 * 100);
    return `<div class="widget-week">
      <span class="ww-item">Week ${weekNum}</span>
      <span class="ww-dot">·</span>
      <span class="ww-item">${now.toLocaleDateString("en-US", { weekday: "long" })}</span>
      <span class="ww-dot">·</span>
      <span class="ww-item">${weekPct}% through week</span>
    </div>`;
  }
  return "";
}

function updateTopWidget() {
  const now = new Date();
  const active = (state.widgets || []).filter(w => w !== "none");
  topWidgetEl.innerHTML = active.map(w => renderWidget(w, now)).join("");
}

// ── Weather ────────────────────────────────────────────────────────────────────

const WEATHER_CODES = {
  113: "☀️", 116: "⛅", 119: "☁️", 122: "☁️",
  143: "🌫️", 176: "🌦️", 179: "🌨️", 182: "🌧️", 185: "🌧️",
  200: "⛈️", 227: "🌨️", 230: "❄️", 248: "🌫️", 260: "🌫️",
  263: "🌦️", 266: "🌦️", 281: "🌧️", 284: "🌧️", 293: "🌦️",
  296: "🌦️", 299: "🌧️", 302: "🌧️", 305: "🌧️", 308: "🌧️",
  311: "🌧️", 314: "🌧️", 317: "🌨️", 320: "🌨️", 323: "🌨️",
  326: "🌨️", 329: "❄️", 332: "❄️", 335: "❄️", 338: "❄️",
  350: "🌧️", 353: "🌦️", 356: "🌧️", 359: "🌧️", 362: "🌨️",
  365: "🌨️", 368: "🌨️", 371: "❄️", 374: "🌨️", 377: "🌨️",
  386: "⛈️", 389: "⛈️", 392: "⛈️", 395: "❄️",
};

async function fetchWeather() {
  const weatherIcon = document.getElementById("weatherIcon");
  const weatherText = document.getElementById("weatherText");
  const weatherLoc = document.getElementById("weatherLoc");

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude: lat, longitude: lon } = pos.coords;
    try {
      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://wttr.in/${lat},${lon}?format=j1`, {
          headers: { "User-Agent": "minimal-new-tab-extension/1.1" },
        }),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { "User-Agent": "minimal-new-tab-extension/1.1" },
        }),
      ]);

      const weather = await weatherRes.json();
      const geo = await geoRes.json();

      const current = weather.current_condition[0];
      const tempC = current.temp_C;
      const tempF = current.temp_F;
      const code = parseInt(current.weatherCode);
      const desc = current.weatherDesc[0].value;

      weatherIcon.textContent = WEATHER_CODES[code] || "🌡️";
      weatherText.textContent = `${tempC}°C / ${tempF}°F · ${desc}`;

      const city = geo.address.city || geo.address.town || geo.address.village || geo.address.county || "";
      const country = geo.address.country_code?.toUpperCase() || "";
      weatherLoc.textContent = [city, country].filter(Boolean).join(", ");
    } catch (_) {}
  }, () => {});
}

// ── Search ─────────────────────────────────────────────────────────────────────

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;
  let target = q;
  if (!/^https?:\/\//i.test(q) && !/^localhost/i.test(q)) {
    target = state.searchEngine + encodeURIComponent(q);
  }
  window.location.href = target;
});

// ── Quick Links ────────────────────────────────────────────────────────────────

function renderLinks() {
  const container = document.getElementById("quickLinks");
  container.innerHTML = "";
  state.links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.className = "quick-link";

    const favicon = document.createElement("img");
    favicon.className = "link-favicon";
    try {
      const domain = new URL(link.url).hostname;
      favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (_) {
      favicon.style.display = "none";
    }
    favicon.onerror = () => (favicon.style.display = "none");

    const label = document.createElement("span");
    label.textContent = link.label;

    a.appendChild(favicon);
    a.appendChild(label);
    container.appendChild(a);
  });
}

// ── Settings Panel ─────────────────────────────────────────────────────────────

const settingsPanel = document.getElementById("settingsPanel");
const settingsOverlay = document.getElementById("settingsOverlay");

function openSettings() {
  settingsPanel.classList.add("open");
  settingsOverlay.classList.add("open");
  renderLinksEditor();
}

function closeSettings() {
  settingsPanel.classList.remove("open");
  settingsOverlay.classList.remove("open");
}

document.getElementById("gearBtn").addEventListener("click", openSettings);
document.getElementById("settingsClose").addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", closeSettings);

// Segmented controls

function setupSegmented(id, stateKey, onChange) {
  const el = document.getElementById(id);
  el.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      el.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state[stateKey] = btn.dataset.value;
      saveState();
      onChange(btn.dataset.value);
    });
  });
}

function syncSegmented(id, value) {
  const el = document.getElementById(id);
  el.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

setupSegmented("themeSegmented", "theme", () => applyTheme());
setupSegmented("formatSegmented", "format", () => updateClock());
setupSegmented("searchSegmented", "searchEngine", () => {});

// Multi-select widget control
(function setupWidgetMulti() {
  const el = document.getElementById("widgetSegmented");
  el.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.value;
      if (val === "none") {
        state.widgets = [];
      } else {
        const idx = state.widgets.indexOf(val);
        if (idx === -1) state.widgets.push(val);
        else state.widgets.splice(idx, 1);
      }
      syncWidgetSegmented();
      saveState();
      updateTopWidget();
    });
  });
})();

function syncWidgetSegmented() {
  const el = document.getElementById("widgetSegmented");
  const active = state.widgets || [];
  el.querySelectorAll(".seg-btn").forEach((btn) => {
    if (btn.dataset.value === "none") {
      btn.classList.toggle("active", active.length === 0);
    } else {
      btn.classList.toggle("active", active.includes(btn.dataset.value));
    }
  });
}

// Name input
const nameInput = document.getElementById("nameInput");
nameInput.addEventListener("input", () => {
  state.name = nameInput.value;
  saveState();
});

// Links editor
function renderLinksEditor() {
  const editor = document.getElementById("linksEditor");
  editor.innerHTML = "";
  state.links.forEach((link, i) => {
    const row = document.createElement("div");
    row.className = "link-row";

    const labelInput = document.createElement("input");
    labelInput.className = "settings-input link-input";
    labelInput.value = link.label;
    labelInput.placeholder = "Label";
    labelInput.addEventListener("input", () => {
      state.links[i].label = labelInput.value;
      saveState();
      renderLinks();
    });

    const urlInput = document.createElement("input");
    urlInput.className = "settings-input link-input";
    urlInput.value = link.url;
    urlInput.placeholder = "https://...";
    urlInput.addEventListener("input", () => {
      state.links[i].url = urlInput.value;
      saveState();
      renderLinks();
    });

    const del = document.createElement("button");
    del.className = "link-del";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      state.links.splice(i, 1);
      saveState();
      renderLinks();
      renderLinksEditor();
    });

    row.appendChild(labelInput);
    row.appendChild(urlInput);
    row.appendChild(del);
    editor.appendChild(row);
  });
}

document.getElementById("addLinkBtn").addEventListener("click", () => {
  state.links.push({ label: "New", url: "https://" });
  saveState();
  renderLinks();
  renderLinksEditor();
});

// ── Init ───────────────────────────────────────────────────────────────────────

loadState();
applyTheme();
updateTopWidget();
renderLinks();
fetchWeather();

syncSegmented("themeSegmented", state.theme);
syncSegmented("formatSegmented", state.format);
syncSegmented("searchSegmented", state.searchEngine);
syncWidgetSegmented();
nameInput.value = state.name;
updateClock();
