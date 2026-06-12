# 🌤 Atmos — Premium Weather App

![Atmos Weather App](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A **premium glassmorphic weather application** built with React + Vite, featuring real-time worldwide weather data, animated sky backgrounds, and a Google Weather–level experience.

---

## ✨ Features

### 🌍 Global City Search
- Powered by **Google Geocoding API** — the same API Google Weather uses
- Instant city suggestions with **emoji country flags** 🇮🇳 🇺🇸 🇬🇧
- Searches every city, town, and village on Earth (200M+ locations)
- **Popular cities shown by default** (including Chikhli, Navsari and 40+ world cities)
- 3-tier fallback: Google → OpenWeatherMap → OpenStreetMap

### 📍 Live Location Detection
- One-click **GPS-based location** via browser Geolocation API
- **Google Reverse Geocoding** returns your exact city name
- Animated radar ping 🔵 while detecting
- Clear error messages if location access is denied

### 🌡️ Accurate Weather Data
- Real-time data via **OpenWeatherMap** (activates automatically)
- Falls back to **Open-Meteo** (ECMWF model — same accuracy as weather.gov)
- **Auto-refreshes every 10 minutes** like Google Weather
- Covers: temperature, feels like, humidity, wind speed/gusts, pressure, visibility, UV index, rain probability, air quality

### 🎨 Premium UI Design
- **Glassmorphic cards** with backdrop blur and frosted glass effect
- **Animated sky background** — glowing sun, floating clouds, light streaks
- Smooth **dark/light mode toggle** with full CSS variable theming
- Animated custom **SVG weather icons** (sun with flame rays, rain drops, snow, storm)
- Smooth micro-animations on every interaction

### 📍 My Places
- Save unlimited cities to your personal list
- Click any saved city to instantly switch weather
- 🗑️ Remove places with one click
- **40 popular world cities** pre-loaded for quick access
- All saved places persist via **localStorage**

### 📅 Forecast Panels
- **5-day daily forecast** with min/max temperatures
- **Hour-by-hour forecast** with temperature curve chart
- **Air Quality Index** with PM2.5, PM10, NO₂, O₃ data
- Weather highlights: UV Index, Wind Speed, Humidity, Sunrise/Sunset

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd weather-app

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_OPENWEATHER_API_KEY=your_openweathermap_key
VITE_GOOGLE_API_KEY=your_google_api_key
```

#### Getting API Keys

| Service | Where to get it | Cost |
|---|---|---|
| **OpenWeatherMap** | [openweathermap.org/api](https://openweathermap.org/api) | Free tier (1000 calls/day) |
| **Google Geocoding** | [console.cloud.google.com](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com) | Free tier ($200/month credit) |

> ⚠️ OpenWeatherMap keys take **up to 2 hours** to activate after creation. The app automatically falls back to Open-Meteo until it's ready.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── CurrentWeather.jsx    # Main weather display
│   │   ├── AirQuality.jsx        # AQI card
│   │   └── WeatherHighlights.jsx # Stat cards (UV, Wind, etc.)
│   ├── Forecast/
│   │   ├── DailyForecast.jsx     # 5-day forecast grid
│   │   └── HourlyForecast.jsx    # Hour-by-hour scroll
│   ├── Layout/
│   │   └── TopNav.jsx            # Search bar + My Places drawer
│   └── WeatherIcon.jsx           # Animated SVG weather icons
├── context/
│   └── WeatherContext.jsx        # Global state + auto-refresh
├── hooks/
│   └── useGeolocation.js         # GPS + Google reverse geocoding
├── utils/
│   └── weatherApi.js             # All API calls (OWM + Open-Meteo + Google)
├── App.jsx                       # Main layout + animated sky background
└── index.css                     # Design system (CSS variables, glassmorphism)
```

---

## 🔑 API Stack

| API | Used For | Docs |
|---|---|---|
| **OpenWeatherMap** | Current weather, forecast, AQI | [docs.openweathermap.org](https://openweathermap.org/api) |
| **Google Geocoding** | City search + reverse geocoding | [developers.google.com/maps/geocoding](https://developers.google.com/maps/documentation/geocoding) |
| **Open-Meteo** | Weather fallback (free, no key) | [open-meteo.com](https://open-meteo.com) |
| **Open-Meteo AQ** | Air quality fallback | [open-meteo.com/en/docs/air-quality-api](https://open-meteo.com/en/docs/air-quality-api) |
| **BigDataCloud** | Location name fallback | [bigdatacloud.com](https://www.bigdatacloud.com) |
| **OpenStreetMap** | City search fallback | [nominatim.openstreetmap.org](https://nominatim.openstreetmap.org) |

---

## 🎨 Design System

The app uses a CSS variable–based design system supporting full **dark/light mode**:

```css
/* Dark Mode (default) */
--glass-bg: rgba(255, 255, 255, 0.08)
--text: #ffffff
--primary: #6c47ff

/* Light Mode (html.light) */
--glass-bg: rgba(255, 255, 255, 0.55)
--text: #1e1040
```

### Background
The animated sky background uses layered CSS:
- Multi-radial gradient base (deep blue → purple → orange)
- Glowing sun with `::before` / `::after` pseudo-elements
- 4 floating color blobs with `blob-float` keyframe animation
- 2 drifting cloud shapes with `cloud-drift` animation
- Diagonal light streak with shimmer animation

---

## 📱 Responsive Design

| Breakpoint | Layout |
|---|---|
| `> 900px` | Two-column grid (weather + forecast side by side) |
| `< 900px` | Single column, stacked layout |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 8** — Build tool & dev server
- **Axios** — HTTP client
- **CSS Variables** — Theming system (no Tailwind)
- **localStorage** — Persist preferences & favorites

---

## 📄 License

MIT © 2025 — Built with ❤️ using React + Vite
