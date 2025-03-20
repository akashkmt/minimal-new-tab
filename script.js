const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");
const toggleButton = document.getElementById("toggleFormat");
const formatText = document.getElementById("formatText");
const locationInfoElement = document.getElementById("locationInfo");
const themeToggle = document.getElementById("themeToggle");
const themeText = document.getElementById("themeText");
let is24Hour = false;

function updateTime() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  if (!is24Hour) {
    hours = hours % 12 || 12;
  }

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function updateDate() {
  const now = new Date("2025-03-20");
  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  dateElement.textContent = now.toLocaleDateString("en-US", options);
}

toggleButton.addEventListener("change", () => {
  is24Hour = toggleButton.checked;
  updateTime();
});

setInterval(updateTime, 1000);
updateTime();
updateDate();

function fetchLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          const state = data.address.state || "";
          const country = data.address.country || "";
          locationInfoElement.textContent =
            state && country ? `${state}, ${country}` : `${state || country}`;
        } catch (error) {
          console.log(error);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  } else {
    console.log("Geolocation not supported");
  }
}

fetchLocation();

function applyTheme(theme) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
}

const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

const defaultTheme = systemPrefersDark ? "dark" : "light";
themeToggle.checked = systemPrefersDark;
themeText.textContent =
  defaultTheme.charAt(0).toUpperCase() + defaultTheme.slice(1);
applyTheme(defaultTheme);
localStorage.setItem("theme", defaultTheme);

themeToggle.addEventListener("change", () => {
  const selectedTheme = themeToggle.checked ? "dark" : "light";
  themeText.textContent =
    selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1);
  applyTheme(selectedTheme);
  localStorage.setItem("theme", selectedTheme); // Persist theme choice
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  themeToggle.checked = savedTheme === "dark";
  themeText.textContent =
    savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
  applyTheme(savedTheme);
}
