// ── State ─────────────────────────────────────────────────────────────────────

const DEFAULT_LINKS = [
  { label: "GitHub", url: "https://github.com" },
  { label: "Gmail", url: "https://mail.google.com" },
  { label: "YouTube", url: "https://youtube.com" },
];

const DEFAULT_HABITS = [
  { id: "h1", label: "Exercise" },
  { id: "h2", label: "Read" },
  { id: "h3", label: "Meditate" },
];

const PANEL_IDS = [
  "intention",
  "pomodoro",
  "worldclocks",
  "habits",
  "scratch",
  "countdown",
];

// Default panel positions — spread across canvas, not overlapping
const DEFAULT_PANEL_LAYOUT = {
  intention: { x: 24, y: 24, w: null, h: null, visible: false },
  pomodoro: { x: 24, y: 148, w: null, h: null, visible: false },
  worldclocks: { x: 24, y: 392, w: null, h: null, visible: false },
  habits: { x: 308, y: 148, w: null, h: null, visible: false },
  scratch: { x: 308, y: 372, w: null, h: null, visible: false },
  countdown: { x: 752, y: 148, w: null, h: null, visible: false },
};

let state = {
  theme: "system",
  format: "24",
  searchEngine: "https://google.com/search?q=",
  links: DEFAULT_LINKS,
  name: "",
  widgets: ["progress"],
  panelLayout: DEFAULT_PANEL_LAYOUT,
  pomoWork: 25,
  pomoBreak: 5,
  habits: DEFAULT_HABITS,
  habitLog: {},
  worldClocks: [],
  birthday: "",
  countdownEvent: "",
  countdownDate: "",
  scratch: "",
  todos: [],
  intentionDate: "",
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  if (state.theme === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  return state.theme;
}

function applyTheme() {
  document.body.dataset.theme = resolvedTheme();
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (state.theme === "system") applyTheme();
  });

// ── Clock ──────────────────────────────────────────────────────────────────────

const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  if (state.format === "12") {
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clockEl.innerHTML = `${h}:${m}<span class="clock-period">${period}</span>`;
  } else {
    clockEl.textContent = `${String(h).padStart(2, "0")}:${m}`;
  }
}

function updateDate() {
  dateEl.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function updateGreeting() {
  const h = new Date().getHours();
  const period = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  const name = state.name ? state.name.trim() : "";
  const el = document.getElementById("greeting");
  if (el)
    el.textContent = name ? `Good ${period}, ${name}.` : `Good ${period}.`;
}

setInterval(() => {
  updateClock();
  updateTopWidget();
  updateGreeting();
}, 1000);
updateClock();
updateDate();
updateGreeting();

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
  [
    "You don't rise to the level of your goals, you fall to the level of your systems.",
    "James Clear",
  ],
  [
    "It does not matter how slowly you go as long as you do not stop.",
    "Confucius",
  ],
  ["The secret of getting ahead is getting started.", "Mark Twain"],
  ["Hard choices, easy life. Easy choices, hard life.", "Jerzy Gregorek"],
  [
    "What you do every day matters more than what you do once in a while.",
    "Gretchen Rubin",
  ],
  ["Perfection is the enemy of progress.", "Winston Churchill"],
  ["Be stubborn on vision, flexible on details.", "Jeff Bezos"],
  [
    "Everything should be made as simple as possible, but not simpler.",
    "Albert Einstein",
  ],
  [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Chinese Proverb",
  ],
  ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
  ["First, solve the problem. Then, write the code.", "John Johnson"],
  [
    "The most dangerous kind of waste is the waste we do not recognize.",
    "Shigeo Shingo",
  ],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["An hour of planning can save you ten hours of doing.", "Dale Carnegie"],
  [
    "Absorb what is useful, discard what is not, add what is uniquely your own.",
    "Bruce Lee",
  ],
  [
    "You can't use up creativity. The more you use, the more you have.",
    "Maya Angelou",
  ],
  ["Motivation gets you started. Habit keeps you going.", "Jim Ryun"],
  [
    "The quality of your life is the quality of your questions.",
    "Tony Robbins",
  ],
  [
    "Either write something worth reading or do something worth writing.",
    "Benjamin Franklin",
  ],
  [
    "Energy, not time, is the fundamental currency of high performance.",
    "Jim Loehr",
  ],
  ["The expert in anything was once a beginner.", "Helen Hayes"],
  ["Don't count the days, make the days count.", "Muhammad Ali"],
  [
    "Build something 100 people love, not something 1 million people kind of like.",
    "Paul Graham",
  ],
  [
    "If you're not embarrassed by the first version, you launched too late.",
    "Reid Hoffman",
  ],
  ["Strong opinions, loosely held.", "Paul Saffo"],
  [
    "The goal is not to be better than the other man, but your previous self.",
    "Dalai Lama",
  ],
  ["Do more of what works and less of what doesn't.", ""],
  [
    "Discipline is choosing between what you want now and what you want most.",
    "",
  ],
  ["Start before you're ready.", ""],
  ["Make fewer decisions better.", ""],
  ["Less, but better.", "Dieter Rams"],
];

const topWidgetEl = document.getElementById("topWidget");

function renderWidget(key, now) {
  if (key === "progress") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const pct = Math.round(
      ((now - startOfDay) / (endOfDay - startOfDay)) * 100,
    );
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
    const weekNum = Math.ceil(
      ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7,
    );
    const dayOfWeek = now.getDay();
    const weekPct = Math.round(((dayOfWeek === 0 ? 7 : dayOfWeek) / 7) * 100);
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
  const active = (state.widgets || []).filter((w) => w !== "none");
  topWidgetEl.innerHTML = active.map((w) => renderWidget(w, now)).join("");
}

// ── Weather ────────────────────────────────────────────────────────────────────

const WEATHER_CODES = {
  113: "☀️",
  116: "⛅",
  119: "☁️",
  122: "☁️",
  143: "🌫️",
  176: "🌦️",
  179: "🌨️",
  182: "🌧️",
  185: "🌧️",
  200: "⛈️",
  227: "🌨️",
  230: "❄️",
  248: "🌫️",
  260: "🌫️",
  263: "🌦️",
  266: "🌦️",
  281: "🌧️",
  284: "🌧️",
  293: "🌦️",
  296: "🌦️",
  299: "🌧️",
  302: "🌧️",
  305: "🌧️",
  308: "🌧️",
  311: "🌧️",
  314: "🌧️",
  317: "🌨️",
  320: "🌨️",
  323: "🌨️",
  326: "🌨️",
  329: "❄️",
  332: "❄️",
  335: "❄️",
  338: "❄️",
  350: "🌧️",
  353: "🌦️",
  356: "🌧️",
  359: "🌧️",
  362: "🌨️",
  365: "🌨️",
  368: "🌨️",
  371: "❄️",
  374: "🌨️",
  377: "🌨️",
  386: "⛈️",
  389: "⛈️",
  392: "⛈️",
  395: "❄️",
};

async function fetchWeather() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const [weatherRes, geoRes] = await Promise.all([
          fetch(`https://wttr.in/${lat},${lon}?format=j1`, {
            headers: { "User-Agent": "minimal-new-tab-extension/1.1" },
          }),
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "User-Agent": "minimal-new-tab-extension/1.1" } },
          ),
        ]);
        const weather = await weatherRes.json();
        const geo = await geoRes.json();
        const cur = weather.current_condition[0];
        const code = parseInt(cur.weatherCode);
        document.getElementById("weatherIcon").textContent =
          WEATHER_CODES[code] || "🌡️";
        document.getElementById("weatherText").textContent =
          `${cur.temp_C}°C / ${cur.temp_F}°F · ${cur.weatherDesc[0].value}`;
        const city =
          geo.address.city ||
          geo.address.town ||
          geo.address.village ||
          geo.address.county ||
          "";
        const country = geo.address.country_code?.toUpperCase() || "";
        document.getElementById("weatherLoc").textContent = [city, country]
          .filter(Boolean)
          .join(", ");
      } catch (_) {}
    },
    () => {},
  );
}

// ── Search ─────────────────────────────────────────────────────────────────────

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;
  window.location.href =
    /^https?:\/\//i.test(q) || /^localhost/i.test(q)
      ? q
      : state.searchEngine + encodeURIComponent(q);
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement.tagName !== "INPUT" &&
    document.activeElement.tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }
  // number keys for quick links
  if (!e.metaKey && !e.ctrlKey && !e.altKey && /^[1-9]$/.test(e.key)) {
    if (
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA"
    ) {
      const link = state.links[parseInt(e.key) - 1];
      if (link) window.location.href = link.url;
    }
  }
});

// ── Quick Links ────────────────────────────────────────────────────────────────

function renderLinks() {
  const container = document.getElementById("quickLinks");
  container.innerHTML = "";
  state.links.forEach((link, i) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.className = "quick-link";
    if (i < 9) a.title = `Press ${i + 1} to open`;

    const favicon = document.createElement("img");
    favicon.className = "link-favicon";
    try {
      favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`;
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

// ── Today's Todos ──────────────────────────────────────────────────────────────

function initIntention() {
  const today = todayKey();
  if (state.intentionDate !== today) {
    state.todos = (state.todos || []).filter((t) => !t.done);
    state.intentionDate = today;
    saveState();
  }
  if (!state.todos) state.todos = [];
  document.getElementById("intentionDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  renderTodos();
}

function renderTodos() {
  const container = document.getElementById("todoList");
  const addInput = document.getElementById("todoAddInput");
  if (!container) return;
  container.innerHTML = "";

  (state.todos || []).forEach((todo, i) => {
    const row = document.createElement("div");
    row.className = `todo-row${todo.done ? " done" : ""}`;

    const cb = document.createElement("button");
    cb.className = "todo-check";
    cb.textContent = todo.done ? "✓" : "";
    cb.addEventListener("click", () => {
      state.todos[i].done = !state.todos[i].done;
      saveState();
      renderTodos();
    });

    const lbl = document.createElement("span");
    lbl.className = "todo-label";
    lbl.textContent = todo.text;
    lbl.contentEditable = true;
    lbl.spellcheck = false;
    lbl.addEventListener("blur", () => {
      state.todos[i].text = lbl.textContent.trim();
      if (!state.todos[i].text) {
        state.todos.splice(i, 1);
      }
      saveState();
      renderTodos();
    });
    lbl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        lbl.blur();
        addInput && addInput.focus();
      }
    });

    const del = document.createElement("button");
    del.className = "todo-del";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      state.todos.splice(i, 1);
      saveState();
      renderTodos();
    });

    row.appendChild(cb);
    row.appendChild(lbl);
    row.appendChild(del);
    container.appendChild(row);
  });
}

function addTodo(text) {
  const t = text.trim();
  if (!t) return;
  if (!state.todos) state.todos = [];
  state.todos.push({ text: t, done: false });
  saveState();
  renderTodos();
}

document.getElementById("todoAddForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("todoAddInput");
  addTodo(input.value);
  input.value = "";
});

// ── Pomodoro ───────────────────────────────────────────────────────────────────

let pomoState = {
  mode: "work", // "work" | "break"
  running: false,
  remaining: 0,
  sessions: 0,
  intervalId: null,
};

const pomoTimerEl = document.getElementById("pomoTimer");
const pomoBadgeEl = document.getElementById("pomoBadge");
const pomoToggleEl = document.getElementById("pomoToggleBtn");
const pomoResetEl = document.getElementById("pomoResetBtn");
const pomoDotsEl = document.getElementById("pomoDots");

function pomoSeconds() {
  return (pomoState.mode === "work" ? state.pomoWork : state.pomoBreak) * 60;
}

function formatPomoTime(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function renderPomoDots() {
  pomoDotsEl.innerHTML = Array.from(
    { length: 4 },
    (_, i) =>
      `<span class="pomo-dot ${i < pomoState.sessions ? "filled" : ""}"></span>`,
  ).join("");
}

function pomoTick() {
  if (pomoState.remaining <= 0) {
    clearInterval(pomoState.intervalId);
    pomoState.running = false;
    if (pomoState.mode === "work") {
      pomoState.sessions = (pomoState.sessions % 4) + 1;
      pomoState.mode = "break";
    } else {
      pomoState.mode = "work";
    }
    pomoState.remaining = pomoSeconds();
    renderPomoUI();
    pomoNotify();
    return;
  }
  pomoState.remaining--;
  pomoTimerEl.textContent = formatPomoTime(pomoState.remaining);
}

function pomoNotify() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(
      pomoState.mode === "break"
        ? "Break time! Rest up."
        : "Focus session started.",
      {
        icon: "icons/icon-48.png",
      },
    );
  }
}

function renderPomoUI() {
  pomoTimerEl.textContent = formatPomoTime(pomoState.remaining);
  pomoBadgeEl.textContent = pomoState.mode === "work" ? "Work" : "Break";
  pomoBadgeEl.dataset.mode = pomoState.mode;
  pomoToggleEl.textContent = pomoState.running ? "Pause" : "Start";
  renderPomoDots();
}

function pomoReset() {
  clearInterval(pomoState.intervalId);
  pomoState.running = false;
  pomoState.mode = "work";
  pomoState.remaining = pomoSeconds();
  pomoState.sessions = 0;
  renderPomoUI();
}

pomoToggleEl.addEventListener("click", () => {
  if (Notification.permission === "default") Notification.requestPermission();
  if (pomoState.running) {
    clearInterval(pomoState.intervalId);
    pomoState.running = false;
    pomoToggleEl.textContent = "Start";
  } else {
    pomoState.running = true;
    pomoToggleEl.textContent = "Pause";
    pomoState.intervalId = setInterval(pomoTick, 1000);
  }
});

pomoResetEl.addEventListener("click", pomoReset);

// ── Habits ─────────────────────────────────────────────────────────────────────

function todayHabits() {
  const key = todayKey();
  if (!state.habitLog[key]) state.habitLog[key] = {};
  return state.habitLog[key];
}

function renderHabits() {
  const log = todayHabits();
  const container = document.getElementById("habitsList");
  container.innerHTML = "";
  document.getElementById("habitsDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  state.habits.forEach((habit) => {
    const done = !!log[habit.id];
    const streak = calcStreak(habit.id);

    const item = document.createElement("div");
    item.className = `habit-item ${done ? "done" : ""}`;
    item.innerHTML = `
      <button class="habit-check" data-id="${habit.id}">${done ? "✓" : ""}</button>
      <span class="habit-label">${habit.label}</span>
      <span class="habit-streak">${streak > 0 ? `🔥 ${streak}` : ""}</span>`;
    item.querySelector(".habit-check").addEventListener("click", () => {
      const l = todayHabits();
      l[habit.id] = !l[habit.id];
      saveState();
      renderHabits();
    });
    container.appendChild(item);
  });
}

function calcStreak(habitId) {
  let streak = 0;
  const d = new Date();
  // start from yesterday so today's incomplete doesn't break streak
  d.setDate(d.getDate() - 1);
  while (streak < 365) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (state.habitLog[key]?.[habitId]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

// ── World Clocks ───────────────────────────────────────────────────────────────

const ALL_TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : [
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Asia/Dubai",
      "Australia/Sydney",
      "Pacific/Auckland",
    ];

function renderWorldClocks() {
  const list = document.getElementById("worldClocksList");
  if (!state.worldClocks.length) {
    list.innerHTML = `<div class="wc-empty">No clocks added. Add one in settings.</div>`;
    return;
  }
  list.innerHTML = "";
  const now = new Date();
  state.worldClocks.forEach((tz) => {
    const timeStr = now.toLocaleTimeString("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: state.format === "12",
    });
    const cityLabel = tz.split("/").pop().replace(/_/g, " ");
    const row = document.createElement("div");
    row.className = "wc-row";
    row.innerHTML = `<span class="wc-city">${cityLabel}</span><span class="wc-time">${timeStr}</span>`;
    list.appendChild(row);
  });
}

setInterval(renderWorldClocks, 1000);

function populateTzSelect() {
  const sel = document.getElementById("tzSelect");
  ALL_TIMEZONES.forEach((tz) => {
    const opt = document.createElement("option");
    opt.value = tz;
    opt.textContent = tz.replace(/_/g, " ");
    sel.appendChild(opt);
  });
}

document.getElementById("addTzBtn").addEventListener("click", () => {
  const tz = document.getElementById("tzSelect").value;
  if (tz && !state.worldClocks.includes(tz)) {
    state.worldClocks.push(tz);
    saveState();
    renderWorldClocks();
    renderWorldClocksEditor();
  }
});

function renderWorldClocksEditor() {
  const editor = document.getElementById("worldClocksEditor");
  editor.innerHTML = "";
  state.worldClocks.forEach((tz, i) => {
    const row = document.createElement("div");
    row.className = "link-row";
    row.innerHTML = `<span class="wc-editor-label">${tz.replace(/_/g, " ")}</span>`;
    const del = document.createElement("button");
    del.className = "link-del";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      state.worldClocks.splice(i, 1);
      saveState();
      renderWorldClocks();
      renderWorldClocksEditor();
    });
    row.appendChild(del);
    editor.appendChild(row);
  });
}

// ── Scratch Pad ────────────────────────────────────────────────────────────────

function parseMd(raw) {
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/~~(.+?)~~/g, "<s>$1</s>");
  }

  const lines = raw.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const h3 = line.match(/^### (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    const h1 = line.match(/^# (.+)$/);
    if (h3) {
      html += `<h3>${inline(esc(h3[1]))}</h3>`;
      i++;
      continue;
    }
    if (h2) {
      html += `<h2>${inline(esc(h2[1]))}</h2>`;
      i++;
      continue;
    }
    if (h1) {
      html += `<h1>${inline(esc(h1[1]))}</h1>`;
      i++;
      continue;
    }

    if (line.trim() === "---") {
      html += "<hr>";
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      html += `<blockquote>${inline(esc(line.slice(2)))}</blockquote>`;
      i++;
      continue;
    }

    if (/^- \[[ xX]\] /.test(line) || /^\[[ xX]\] /.test(line)) {
      const checkRe = /^(?:- )?\[[ xX]\] /;
      html += '<ul class="checklist">';
      while (
        i < lines.length &&
        (/^- \[[ xX]\] /.test(lines[i]) || /^\[[ xX]\] /.test(lines[i]))
      ) {
        const checked = /^(?:- )?\[[xX]\] /.test(lines[i]);
        const text = lines[i].replace(checkRe, "");
        html += `<li><input type="checkbox" data-line="${i}"${checked ? " checked" : ""}>${inline(esc(text))}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    if (/^[-*] /.test(line)) {
      html += "<ul>";
      while (
        i < lines.length &&
        /^[-*] /.test(lines[i]) &&
        !/^- \[[ xX]\] /.test(lines[i])
      ) {
        html += `<li>${inline(esc(lines[i].slice(2)))}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    if (/^\d+\. /.test(line)) {
      html += "<ol>";
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const m = lines[i].match(/^\d+\. (.+)$/);
        html += `<li>${inline(esc(m ? m[1] : ""))}</li>`;
        i++;
      }
      html += "</ol>";
      continue;
    }

    const parts = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === "") break;
      if (
        /^#{1,3} /.test(l) ||
        l.trim() === "---" ||
        l.startsWith("> ") ||
        /^[-*] /.test(l) ||
        /^\d+\. /.test(l) ||
        /^\[[ xX]\] /.test(l)
      )
        break;
      parts.push(inline(esc(l)));
      i++;
    }
    if (parts.length) html += `<p>${parts.join("<br>")}</p>`;
  }

  return html;
}

const scratchInput = document.getElementById("scratchInput");
const scratchPreview = document.getElementById("scratchPreview");
const scratchToggle = document.getElementById("scratchToggle");
let scratchMode = "edit"; // "edit" | "preview"

function renderScratchPreview() {
  if (!scratchPreview) return;
  scratchPreview.innerHTML = parseMd(state.scratch || "");
  scratchPreview.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const lineIdx = parseInt(cb.dataset.line, 10);
      const lines = state.scratch.split("\n");
      if (cb.checked) {
        lines[lineIdx] = lines[lineIdx].replace(/^((?:- )?)\[ \]/, "$1[x]");
      } else {
        lines[lineIdx] = lines[lineIdx].replace(/^((?:- )?)\[[xX]\]/, "$1[ ]");
      }
      state.scratch = lines.join("\n");
      scratchInput.value = state.scratch;
      saveState();
      renderScratchPreview();
    });
  });
}

if (scratchInput) {
  scratchInput.addEventListener("input", () => {
    state.scratch = scratchInput.value;
    saveState();
    if (scratchMode === "preview") {
      if (!state.scratch.trim()) {
        scratchMode = "edit";
        scratchToggle.textContent = "Preview";
        scratchInput.style.display = "";
        scratchPreview.style.display = "none";
      } else {
        renderScratchPreview();
      }
    }
  });
}

if (scratchToggle) {
  scratchToggle.addEventListener("click", () => {
    scratchMode = scratchMode === "edit" ? "preview" : "edit";
    scratchToggle.textContent = scratchMode === "edit" ? "Preview" : "Edit";
    scratchInput.style.display = scratchMode === "edit" ? "" : "none";
    scratchPreview.style.display = scratchMode === "preview" ? "" : "none";
    if (scratchMode === "preview") renderScratchPreview();
  });
}

// ── Age Meter ─────────────────────────────────────────────────────────────────

let ageMeterInterval = null;

function updateAgeMeter() {
  const meter = document.getElementById("ageMeter");
  const display = document.getElementById("ageMeterValue");
  if (ageMeterInterval) {
    clearInterval(ageMeterInterval);
    ageMeterInterval = null;
  }
  if (!state.birthday) {
    meter.style.display = "none";
    return;
  }
  meter.style.display = "flex";
  const born = new Date(state.birthday + "T00:00:00");
  function tick() {
    const now = new Date();
    let y = now.getFullYear() - born.getFullYear();
    let m = now.getMonth() - born.getMonth();
    let d = now.getDate() - born.getDate();
    if (d < 0) {
      m--;
      d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }
    display.textContent = `${y} years  ${m} months  ${d} days`;
  }
  tick();
  ageMeterInterval = setInterval(tick, 1000);
}

// ── Countdown ──────────────────────────────────────────────────────────────────

function updateCountdown() {
  const display = document.getElementById("countdownDisplay");
  const title = document.getElementById("countdownTitle");
  if (!state.countdownDate) {
    display.textContent = "Set an event in settings.";
    return;
  }
  const target = new Date(state.countdownDate + "T00:00:00");
  const now = new Date();
  const diff = target - now;
  title.textContent = state.countdownEvent || "Countdown";
  if (diff <= 0) {
    display.innerHTML = `<span class="cd-num">0</span><span class="cd-unit">days</span>`;
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  display.innerHTML = `
    <div class="cd-block"><span class="cd-num">${days}</span><span class="cd-unit">days</span></div>
    <div class="cd-sep">:</div>
    <div class="cd-block"><span class="cd-num">${String(hours).padStart(2, "0")}</span><span class="cd-unit">hrs</span></div>
    <div class="cd-sep">:</div>
    <div class="cd-block"><span class="cd-num">${String(mins).padStart(2, "0")}</span><span class="cd-unit">min</span></div>`;
}

setInterval(updateCountdown, 60000);

// ── Canvas: drag + resize ──────────────────────────────────────────────────────

const PANEL_LABELS = {
  intention: "Today's Intention",
  pomodoro: "Focus Timer",
  worldclocks: "World Clocks",
  habits: "Habits",
  scratch: "Scratch Pad",
  countdown: "Countdown",
};

const MIN_W = 180,
  MIN_H = 80,
  EDGE_PAD = 20;

function getLayout(id) {
  return (
    state.panelLayout[id] ||
    DEFAULT_PANEL_LAYOUT[id] || { x: 40, y: 40, w: 300, h: 160, visible: false }
  );
}

function applyLayout(id) {
  const el = document.getElementById(`panel-${id}`);
  if (!el) return;
  const l = getLayout(id);
  el.style.display = l.visible ? "flex" : "none";
  el.style.left = l.x + "px";
  el.style.top = l.y + "px";
  if (l.w != null) el.style.width = l.w + "px";
  if (l.h != null) el.style.height = l.h + "px";
}

function applyPanels() {
  PANEL_IDS.forEach(applyLayout);
}

function initDragResize() {
  PANEL_IDS.forEach((id) => {
    const el = document.getElementById(`panel-${id}`);
    if (!el) return;

    // Drag via header
    const hd = el.querySelector(".panel-hd");
    hd.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
      e.preventDefault();
      const l = getLayout(id);
      const startX = e.clientX - l.x;
      const startY = e.clientY - l.y;
      el.classList.add("dragging");

      function onMove(ev) {
        const maxX = window.innerWidth - el.offsetWidth - EDGE_PAD;
        const maxY = window.innerHeight - el.offsetHeight - EDGE_PAD;
        l.x = Math.min(Math.max(EDGE_PAD, ev.clientX - startX), maxX);
        l.y = Math.min(Math.max(EDGE_PAD, ev.clientY - startY), maxY);
        el.style.left = l.x + "px";
        el.style.top = l.y + "px";
      }
      function onUp() {
        el.classList.remove("dragging");
        saveState();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // Resize via handle
    const handle = el.querySelector(".resize-handle");
    if (!handle) return;
    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const l = getLayout(id);
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = el.offsetWidth;
      const startH = el.offsetHeight;
      el.classList.add("resizing");

      function onMove(ev) {
        const cs = getComputedStyle(el);
        const minW = parseInt(cs.minWidth) || MIN_W;
        const minH = parseInt(cs.minHeight) || MIN_H;
        l.w = Math.max(minW, startW + ev.clientX - startX);
        l.h = Math.max(minH, startH + ev.clientY - startY);
        el.style.width = l.w + "px";
        el.style.height = l.h + "px";
      }
      function onUp() {
        el.classList.remove("resizing");
        saveState();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  });
}

function renderPanelToggles() {
  const container = document.getElementById("panelToggles");
  container.innerHTML = "";
  PANEL_IDS.forEach((id) => {
    const row = document.createElement("label");
    row.className = "toggle-row";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!getLayout(id).visible;
    cb.addEventListener("change", () => {
      if (!state.panelLayout[id])
        state.panelLayout[id] = { ...DEFAULT_PANEL_LAYOUT[id] };
      state.panelLayout[id].visible = cb.checked;
      saveState();
      applyLayout(id);
    });
    const lbl = document.createElement("span");
    lbl.textContent = PANEL_LABELS[id];
    row.appendChild(cb);
    row.appendChild(lbl);
    container.appendChild(row);
  });
}

// ── Settings Panel ─────────────────────────────────────────────────────────────

const settingsPanel = document.getElementById("settingsPanel");
const settingsOverlay = document.getElementById("settingsOverlay");

function openSettings() {
  settingsPanel.classList.add("open");
  settingsOverlay.classList.add("open");
  renderLinksEditor();
  renderHabitsEditor();
  renderWorldClocksEditor();
  renderPanelToggles();
}

function closeSettings() {
  settingsPanel.classList.remove("open");
  settingsOverlay.classList.remove("open");
}

document.getElementById("gearBtn").addEventListener("click", openSettings);
document
  .getElementById("settingsClose")
  .addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", closeSettings);

// Segmented controls

function setupSegmented(id, stateKey, onChange) {
  const el = document.getElementById(id);
  el.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      el.querySelectorAll(".seg-btn").forEach((b) =>
        b.classList.remove("active"),
      );
      btn.classList.add("active");
      state[stateKey] = btn.dataset.value;
      saveState();
      onChange(btn.dataset.value);
    });
  });
}

function syncSegmented(id, value) {
  document
    .getElementById(id)
    .querySelectorAll(".seg-btn")
    .forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
}

setupSegmented("themeSegmented", "theme", () => applyTheme());
setupSegmented("formatSegmented", "format", () => {
  updateClock();
  renderWorldClocks();
});
setupSegmented("searchSegmented", "searchEngine", () => {});

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
  const active = state.widgets || [];
  document
    .getElementById("widgetSegmented")
    .querySelectorAll(".seg-btn")
    .forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.value === "none"
          ? active.length === 0
          : active.includes(btn.dataset.value),
      );
    });
}

// Name
const nameInput = document.getElementById("nameInput");
nameInput.addEventListener("input", () => {
  state.name = nameInput.value;
  saveState();
  updateGreeting();
});

// Pomodoro settings
const pomoWorkInput = document.getElementById("pomoWorkInput");
const pomoBreakInput = document.getElementById("pomoBreakInput");
pomoWorkInput.addEventListener("change", () => {
  state.pomoWork = Math.max(1, parseInt(pomoWorkInput.value) || 25);
  saveState();
  if (!pomoState.running) pomoReset();
});
pomoBreakInput.addEventListener("change", () => {
  state.pomoBreak = Math.max(1, parseInt(pomoBreakInput.value) || 5);
  saveState();
});

// Habits editor
function renderHabitsEditor() {
  const editor = document.getElementById("habitsEditor");
  editor.innerHTML = "";
  state.habits.forEach((habit, i) => {
    const row = document.createElement("div");
    row.className = "link-row";
    const input = document.createElement("input");
    input.className = "settings-input link-input";
    input.value = habit.label;
    input.placeholder = "Habit name";
    input.addEventListener("input", () => {
      state.habits[i].label = input.value;
      saveState();
      renderHabits();
    });
    const del = document.createElement("button");
    del.className = "link-del";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      state.habits.splice(i, 1);
      saveState();
      renderHabits();
      renderHabitsEditor();
    });
    row.appendChild(input);
    row.appendChild(del);
    editor.appendChild(row);
  });
}

document.getElementById("addHabitBtn").addEventListener("click", () => {
  state.habits.push({ id: `h${Date.now()}`, label: "New habit" });
  saveState();
  renderHabits();
  renderHabitsEditor();
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

// Age meter settings
const birthdayInput = document.getElementById("birthdayInput");
const clearBirthdayBtn = document.getElementById("clearBirthdayBtn");
birthdayInput.addEventListener("change", () => {
  state.birthday = birthdayInput.value;
  saveState();
  updateAgeMeter();
});
clearBirthdayBtn.addEventListener("click", () => {
  state.birthday = "";
  birthdayInput.value = "";
  saveState();
  updateAgeMeter();
});

// Countdown settings
const countdownEventInput = document.getElementById("countdownEventInput");
const countdownDateInput = document.getElementById("countdownDateInput");
countdownEventInput.addEventListener("input", () => {
  state.countdownEvent = countdownEventInput.value;
  saveState();
  updateCountdown();
});
countdownDateInput.addEventListener("change", () => {
  state.countdownDate = countdownDateInput.value;
  saveState();
  updateCountdown();
});

// ── Init ───────────────────────────────────────────────────────────────────────

loadState();
// merge any missing panel layouts from defaults
PANEL_IDS.forEach((id) => {
  if (!state.panelLayout) state.panelLayout = {};
  if (!state.panelLayout[id])
    state.panelLayout[id] = { ...DEFAULT_PANEL_LAYOUT[id] };
});
applyTheme();
applyPanels();
initDragResize();
updateTopWidget();
renderLinks();
renderHabits();
renderWorldClocks();
updateCountdown();
updateAgeMeter();
updateSpeedWidget();
fetchWeather();
initIntention();
populateTzSelect();

pomoState.remaining = state.pomoWork * 60;
renderPomoUI();

scratchInput.value = state.scratch;
if (state.scratch && state.scratch.trim()) {
  scratchMode = "preview";
  scratchToggle.textContent = "Edit";
  scratchInput.style.display = "none";
  scratchPreview.style.display = "";
  renderScratchPreview();
}
birthdayInput.value = state.birthday;
countdownEventInput.value = state.countdownEvent;
countdownDateInput.value = state.countdownDate;
pomoWorkInput.value = state.pomoWork;
pomoBreakInput.value = state.pomoBreak;
nameInput.value = state.name;

syncSegmented("themeSegmented", state.theme);
syncSegmented("formatSegmented", state.format);
syncSegmented("searchSegmented", state.searchEngine);
syncWidgetSegmented();
updateClock();
