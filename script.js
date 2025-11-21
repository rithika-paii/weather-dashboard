const API_BASE = "http://127.0.0.1:8000";

let currentUnit = "metric";
let detailedMode = true;
let currentTheme = "dark";
let chartRef = null;
let map = null;

// DOM references
const cityInput = document.getElementById("cityInput");
const historySelect = document.getElementById("historySelect");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const detailedSection = document.getElementById("detailedSection");

const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

const forecastContainer = document.getElementById("forecast");
const hourlyContainer = document.getElementById("hourly");
const canvas = document.getElementById("hourlyChart");

const aqiValue = document.getElementById("aqiValue");
const aqiBadge = document.getElementById("aqiBadge");
const uvEl = document.getElementById("uv");

const alertsContainer = document.getElementById("alerts");
const alertsEmpty = document.getElementById("alertsEmpty");

const outfitBox = document.getElementById("outfitBox");

const compareInput = document.getElementById("compareInput");
const compareResults = document.getElementById("compareResults");

// =====================================================
// MAIN FETCH
// =====================================================
async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  errorEl.textContent = "";
  resultEl.style.display = "none";

  saveSearch(city);

  try {
    const url = `${API_BASE}/weather?city=${city}&units=${currentUnit}`;
    const data = await fetch(url).then(r => r.json());
    const unit = currentUnit === "metric" ? "°C" : "°F";

    cityNameEl.textContent = data.city;
    tempEl.textContent = `${data.temperature} ${unit}`;
    conditionEl.textContent = data.condition;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

    feelsLikeEl.textContent = `${data.feels_like} ${unit}`;
    humidityEl.textContent = data.humidity;
    windEl.textContent = `${data.wind_speed} m/s`;
    sunriseEl.textContent = new Date(data.sunrise * 1000).toLocaleTimeString();
    sunsetEl.textContent = new Date(data.sunset * 1000).toLocaleTimeString();

    resultEl.style.display = "block";

    fetchCoords(city);
    fetchForecast(city);
    fetchHourly(city);
    fetchAQI(city);
    fetchUV(city);
    fetchAlerts(city);
    fetchOutfit(city);

  } catch {
    errorEl.textContent = "City not found";
  }
}

// =====================================================
// FORECAST
// =====================================================
async function fetchForecast(city) {
  forecastContainer.innerHTML = "";
  const url = `${API_BASE}/forecast?city=${city}&units=${currentUnit}`;
  const data = await fetch(url).then(r => r.json());
  const unit = currentUnit === "metric" ? "°C" : "°F";

  data.daily.forEach(day => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    const weekday = new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
    });

    card.innerHTML = `
      <strong>${weekday}</strong><br>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" width="60">
      <div>${day.condition}</div>
      <div>Max: ${day.max_temp} ${unit}</div>
      <div>Min: ${day.min_temp} ${unit}</div>
      <div>Precip: ${day.precip_mm} mm</div>
    `;

    forecastContainer.appendChild(card);
  });
}

// =====================================================
// HOURLY
// =====================================================
async function fetchHourly(city) {
  hourlyContainer.innerHTML = "";

  const url = `${API_BASE}/hourly?city=${city}&units=${currentUnit}&hours=12`;
  const data = await fetch(url).then(r => r.json());
  const unit = currentUnit === "metric" ? "°C" : "°F";

  const labels = [];
  const temps = [];

  data.timeline.forEach(row => {
    const time = new Date(row.time).toLocaleTimeString([], { hour: "2-digit" });
    labels.push(time);
    temps.push(row.temperature);

    const card = document.createElement("div");
    card.className = "hour-card";

    card.innerHTML = `
      <strong>${time}</strong><br>
      <img src="https://openweathermap.org/img/wn/${row.icon}@2x.png" width="50"><br>
      <div>${row.temperature} ${unit}</div>
    `;

    hourlyContainer.appendChild(card);
  });

  drawChart(labels, temps);
}

// =====================================================
// AQI
// =====================================================
async function fetchAQI(city) {
  const url = `${API_BASE}/aqi?city=${city}`;
  const data = await fetch(url).then(r => r.json());

  aqiValue.textContent = data.aqi;

  const cat = data.category;
  aqiBadge.textContent = cat;

  const colors = {
    Good: "#16a34a",
    Fair: "#65a30d",
    Moderate: "#ca8a04",
    Poor: "#ea580c",
    "Very Poor": "#dc2626",
  };

  aqiBadge.style.background = colors[cat] || "#475569";
  aqiBadge.style.color = "#fff";
}

// =====================================================
// UV INDEX
// =====================================================
async function fetchUV(city) {
  const url = `${API_BASE}/uv?city=${city}`;
  const data = await fetch(url).then(r => r.json());
  uvEl.textContent = `${data.uv_index} (${data.uv_category})`;
}

// =====================================================
// WEATHER ALERTS
// =====================================================
async function fetchAlerts(city) {
  alertsContainer.innerHTML = "";
  alertsEmpty.textContent = "";

  const url = `${API_BASE}/alerts?city=${city}&units=${currentUnit}`;
  const data = await fetch(url).then(r => r.json());

  if (!data.alerts.length) {
    alertsEmpty.textContent = "No weather alerts 🎉";
    return;
  }

  data.alerts.forEach(alert => {
    const card = document.createElement("div");
    card.className = "alert-card";

    card.innerHTML = `
      <strong>${alert.event}</strong>
      <p>${alert.description}</p>
      <p><small>${alert.sender_name}</small></p>
    `;

    alertsContainer.appendChild(card);
  });
}

// =====================================================
// OUTFIT RECOMMENDATION
// =====================================================
async function fetchOutfit(city) {
  const url = `${API_BASE}/outfit?city=${city}&units=${currentUnit}`;
  const data = await fetch(url).then(r => r.json());

  outfitBox.innerHTML = `
    <p>${data.summary}</p>
    <p><strong>Clothing:</strong> ${data.clothing.join(", ")}</p>
    <p><strong>Accessories:</strong> ${data.accessories.join(", ")}</p>
    <p><strong>Notes:</strong> ${
      data.notes.length ? data.notes.join(" | ") : "No special warnings 😊"
    }</p>
  `;
}

// =====================================================
// COMPARE CITIES
// =====================================================
document.getElementById("compareBtn").onclick = async function () {
  const cities = compareInput.value.trim();
  if (!cities) return;

  const url = `${API_BASE}/compare?cities=${cities}&units=${currentUnit}`;
  const data = await fetch(url).then(r => r.json());

  compareResults.innerHTML = "";

  data.cities.forEach(c => {
    const card = document.createElement("div");
    card.className = "compare-card";

    card.innerHTML = `
      <strong>${c.city}</strong><br>
      Temp: ${c.temperature}<br>
      Cond: ${c.condition}<br>
      Humidity: ${c.humidity}%<br>
      Wind: ${c.wind_speed} m/s<br>
      AQI: ${c.aqi} (${c.aqi_category})
    `;

    compareResults.appendChild(card);
  });
};

// =====================================================
// MAP
// =====================================================
async function fetchCoords(city) {
  const url = `${API_BASE}/coords?city=${city}`;
  const data = await fetch(url).then(r => r.json());

  const lat = data.lat;
  const lon = data.lon;

  if (!map) {
    map = L.map("map").setView([lat, lon], 10);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
  } else {
    map.setView([lat, lon], 10);
  }

  L.marker([lat, lon]).addTo(map);
}

// =====================================================
// HOURLY CHART
// =====================================================
function drawChart(labels, temps) {
  if (chartRef) chartRef.destroy();

  chartRef = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Hourly Temp",
          data: temps,
          borderWidth: 2,
          borderColor: currentTheme === "dark" ? "#38bdf8" : "#1e3a8a",
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: currentTheme === "dark" ? "#e5e7eb" : "#0f172a" } },
        x: { ticks: { color: currentTheme === "dark" ? "#e5e7eb" : "#0f172a" } },
      },
    },
  });
}

// =====================================================
// SEARCH HISTORY
// =====================================================
function saveSearch(city) {
  let history = JSON.parse(localStorage.getItem("history") || "[]");
  history = [city, ...history.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  historySelect.innerHTML = "<option>Recent Searches</option>";
  const history = JSON.parse(localStorage.getItem("history") || "[]");

  history.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    historySelect.appendChild(opt);
  });
}

historySelect.onchange = () => {
  if (historySelect.value !== "Recent Searches") {
    cityInput.value = historySelect.value;
    fetchWeather();
  }
};

// =====================================================
// UI TOGGLES
// =====================================================
document.getElementById("themeToggle").onclick = () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.className = currentTheme;
  localStorage.setItem("theme", currentTheme);

  document.getElementById("themeToggle").textContent =
    currentTheme === "dark" ? "Light Mode" : "Dark Mode";

  if (chartRef) chartRef.destroy();
};

document.getElementById("unitToggle").onclick = () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  document.getElementById("unitToggle").textContent =
    currentUnit === "metric" ? "Switch to °F" : "Switch to °C";
  if (cityInput.value) fetchWeather();
};

document.getElementById("modeToggle").onclick = () => {
  detailedMode = !detailedMode;
  detailedSection.style.display = detailedMode ? "block" : "none";
  document.getElementById("modeToggle").textContent =
    detailedMode ? "Detailed Mode" : "Simple Mode";
};

// =====================================================
// INIT
// =====================================================
window.onload = () => {
  loadHistory();

  let savedTheme = localStorage.getItem("theme") || "dark";
  currentTheme = savedTheme;
  document.body.className = savedTheme;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const url = `${API_BASE}/reverse_geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
      const data = await fetch(url).then(r => r.json());
      cityInput.value = data.city;
      fetchWeather();
    });
  }
};

document.getElementById("searchBtn").onclick = fetchWeather;
cityInput.onkeyup = e => {
  if (e.key === "Enter") fetchWeather();
};
