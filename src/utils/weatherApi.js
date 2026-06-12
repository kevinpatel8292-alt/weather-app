import axios from 'axios';

const OWM_KEY    = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const OWM_BASE   = 'https://api.openweathermap.org';
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const AIR_METEO  = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GOOGLE_GEO = 'https://maps.googleapis.com/maps/api/geocode/json';

// ─── Cached OWM key status (check ONCE, cache 10 min) ───────────────────────
let _owmReady = null;
let _owmCheckedAt = 0;
const OWM_CACHE_MS = 10 * 60 * 1000;

const isOWMReady = async () => {
  if (!OWM_KEY || OWM_KEY === 'your_api_key_here') return false;
  const now = Date.now();
  if (_owmReady !== null && now - _owmCheckedAt < OWM_CACHE_MS) return _owmReady;
  try {
    await axios.get(`${OWM_BASE}/data/2.5/weather`, {
      params: { lat: 51.5074, lon: -0.1278, appid: OWM_KEY },
      timeout: 5000
    });
    _owmReady = true;
  } catch {
    _owmReady = false;
  }
  _owmCheckedAt = Date.now();
  return _owmReady;
};

// ─── WMO weather code → OWM-style condition mapping ─────────────────────────
const mapWMO = (code, isDay = 1) => {
  const d = isDay ? 'd' : 'n';
  const map = {
    0:  { main: 'Clear',        desc: 'Clear Sky',             icon: `01${d}` },
    1:  { main: 'Clouds',       desc: 'Mainly Clear',          icon: `02${d}` },
    2:  { main: 'Clouds',       desc: 'Partly Cloudy',         icon: `03${d}` },
    3:  { main: 'Clouds',       desc: 'Overcast',              icon: `04${d}` },
    45: { main: 'Fog',          desc: 'Foggy',                 icon: `50${d}` },
    48: { main: 'Fog',          desc: 'Rime Fog',              icon: `50${d}` },
    51: { main: 'Drizzle',      desc: 'Light Drizzle',         icon: `09${d}` },
    53: { main: 'Drizzle',      desc: 'Moderate Drizzle',      icon: `09${d}` },
    55: { main: 'Drizzle',      desc: 'Dense Drizzle',         icon: `09${d}` },
    56: { main: 'Drizzle',      desc: 'Freezing Light Drizzle',icon: `09${d}` },
    57: { main: 'Drizzle',      desc: 'Freezing Heavy Drizzle',icon: `09${d}` },
    61: { main: 'Rain',         desc: 'Light Rain',            icon: `10${d}` },
    63: { main: 'Rain',         desc: 'Moderate Rain',         icon: `10${d}` },
    65: { main: 'Rain',         desc: 'Heavy Rain',            icon: `10${d}` },
    66: { main: 'Rain',         desc: 'Light Freezing Rain',   icon: `13${d}` },
    67: { main: 'Rain',         desc: 'Heavy Freezing Rain',   icon: `13${d}` },
    71: { main: 'Snow',         desc: 'Light Snowfall',        icon: `13${d}` },
    73: { main: 'Snow',         desc: 'Moderate Snowfall',     icon: `13${d}` },
    75: { main: 'Snow',         desc: 'Heavy Snowfall',        icon: `13${d}` },
    77: { main: 'Snow',         desc: 'Snow Grains',           icon: `13${d}` },
    80: { main: 'Rain',         desc: 'Light Showers',         icon: `09${d}` },
    81: { main: 'Rain',         desc: 'Moderate Showers',      icon: `09${d}` },
    82: { main: 'Rain',         desc: 'Heavy Showers',         icon: `09${d}` },
    85: { main: 'Snow',         desc: 'Light Snow Showers',    icon: `13${d}` },
    86: { main: 'Snow',         desc: 'Heavy Snow Showers',    icon: `13${d}` },
    95: { main: 'Thunderstorm', desc: 'Thunderstorm',          icon: `11${d}` },
    96: { main: 'Thunderstorm', desc: 'Thunderstorm w/ Hail',  icon: `11${d}` },
    99: { main: 'Thunderstorm', desc: 'Thunderstorm w/ Heavy Hail', icon: `11${d}` },
  };
  return map[code] || map[0];
};

// ─── Reverse geocode: coords → real city name (Google first, BigDataCloud fallback) ───
const reverseGeocode = async (lat, lon) => {
  // Try Google Geocoding API (most accurate)
  if (GOOGLE_KEY) {
    try {
      const res = await axios.get(GOOGLE_GEO, {
        params: { latlng: `${lat},${lon}`, key: GOOGLE_KEY, language: 'en', result_type: 'locality|administrative_area_level_2' }
      });
      if (res.data.status === 'OK' && res.data.results.length > 0) {
        const comps = res.data.results[0].address_components;
        const locality = comps.find(c => c.types.includes('locality'));
        const area2    = comps.find(c => c.types.includes('administrative_area_level_2'));
        const area1    = comps.find(c => c.types.includes('administrative_area_level_1'));
        return locality?.long_name || area2?.long_name || area1?.long_name || res.data.results[0].formatted_address.split(',')[0];
      }
    } catch { /* fall through */ }
  }
  // Fallback: BigDataCloud
  try {
    const res = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: { latitude: lat, longitude: lon, localityLanguage: 'en' }
    });
    return res.data.city || res.data.locality || res.data.principalSubdivision || 'Your Location';
  } catch {
    return 'Your Location';
  }
};

// ─── OWM: normalize description to Title Case ────────────────────────────────
const titleCase = (str) => str ? str.replace(/\b\w/g, c => c.toUpperCase()) : str;

export const weatherApi = {

  // ── City search — Google Geocoding (same API as Google Weather) ──────────
  getCoordinates: async (city) => {
    // 1️⃣ Google Geocoding API — most accurate, all cities worldwide
    if (GOOGLE_KEY) {
      try {
        const res = await axios.get(GOOGLE_GEO, {
          params: { address: city, key: GOOGLE_KEY, language: 'en' }
        });
        if (res.data.status === 'OK') {
          return res.data.results.slice(0, 10).map(r => {
            const comps   = r.address_components;
            const locality = comps.find(c => c.types.includes('locality'));
            const area2    = comps.find(c => c.types.includes('administrative_area_level_2'));
            const area1    = comps.find(c => c.types.includes('administrative_area_level_1'));
            const country  = comps.find(c => c.types.includes('country'));
            return {
              name: locality?.long_name || area2?.long_name || r.formatted_address.split(',')[0],
              lat:  r.geometry.location.lat,
              lon:  r.geometry.location.lng,
              country: country?.short_name || '',
              state:   area1?.long_name || ''
            };
          });
        }
      } catch { /* fall through */ }
    }

    // 2️⃣ OpenWeatherMap Geocoding
    const owmReady = await isOWMReady();
    if (owmReady) {
      try {
        const res = await axios.get(`${OWM_BASE}/geo/1.0/direct`, {
          params: { q: city, limit: 10, appid: OWM_KEY }
        });
        return (res.data || []).map(r => ({
          name: r.name, lat: r.lat, lon: r.lon,
          country: r.country || '', state: r.state || ''
        }));
      } catch { /* fall through */ }
    }

    // 3️⃣ OpenStreetMap Nominatim — 200M+ places worldwide
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: city, format: 'json', limit: 10, addressdetails: 1, 'accept-language': 'en' },
      headers: { 'Accept-Language': 'en' }
    });
    return (res.data || []).map(r => ({
      name: r.address?.city || r.address?.town || r.address?.village
            || r.address?.county || r.name || r.display_name.split(',')[0],
      lat: parseFloat(r.lat), lon: parseFloat(r.lon),
      country: r.address?.country_code?.toUpperCase() || '',
      state: r.address?.state || ''
    }));
  },

  // ── Current weather — accurate, Google-level data ────────────────────────
  getCurrentWeather: async (lat, lon, units = 'metric') => {
    const owmReady = await isOWMReady();

    if (owmReady) {
      // OWM returns: temp, feels_like, humidity, pressure, visibility,
      // wind speed+gust+direction, clouds, sunrise/sunset, rain/snow volume
      const res = await axios.get(`${OWM_BASE}/data/2.5/weather`, {
        params: { lat, lon, units, appid: OWM_KEY }
      });
      const d = res.data;
      // Normalize description
      if (d.weather?.[0]) d.weather[0].description = titleCase(d.weather[0].description);
      return d;
    }

    // ── Open-Meteo fallback (very accurate, hourly model data) ──────────────
    const isMetric = units === 'metric';
    const [meteoRes, cityName] = await Promise.all([
      axios.get(OPEN_METEO, {
        params: {
          latitude: lat, longitude: lon,
          current: [
            'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
            'is_day', 'precipitation', 'weather_code', 'cloud_cover',
            'pressure_msl', 'surface_pressure', 'wind_speed_10m',
            'wind_direction_10m', 'wind_gusts_10m', 'visibility'
          ].join(','),
          daily: [
            'sunrise', 'sunset', 'temperature_2m_max', 'temperature_2m_min',
            'uv_index_max', 'precipitation_probability_max', 'precipitation_sum'
          ].join(','),
          timezone: 'auto',
          temperature_unit: isMetric ? 'celsius' : 'fahrenheit',
          wind_speed_unit: isMetric ? 'ms' : 'mph',
          precipitation_unit: 'mm'
        }
      }),
      reverseGeocode(lat, lon)
    ]);

    const c = meteoRes.data.current;
    const d = meteoRes.data.daily;
    const cond = mapWMO(c.weather_code, c.is_day);

    return {
      weather: [{ main: cond.main, description: cond.desc, icon: cond.icon }],
      main: {
        temp: Math.round(c.temperature_2m * 10) / 10,
        feels_like: Math.round(c.apparent_temperature * 10) / 10,
        humidity: c.relative_humidity_2m,
        pressure: Math.round(c.pressure_msl),
        temp_max: Math.round(d.temperature_2m_max[0] * 10) / 10,
        temp_min: Math.round(d.temperature_2m_min[0] * 10) / 10,
      },
      visibility: c.visibility ? Math.round(c.visibility) : 10000,
      wind: {
        speed: c.wind_speed_10m,
        deg: c.wind_direction_10m,
        gust: c.wind_gusts_10m
      },
      clouds: { all: c.cloud_cover },
      sys: {
        sunrise: Math.floor(new Date(d.sunrise[0]).getTime() / 1000),
        sunset:  Math.floor(new Date(d.sunset[0]).getTime()  / 1000),
      },
      uvi: d.uv_index_max[0],
      rain_chance: d.precipitation_probability_max[0],
      rain_sum: d.precipitation_sum[0],
      name: cityName,
      dt: Math.floor(new Date(c.time).getTime() / 1000)
    };
  },

  // ── 5-day / 3-hour forecast ───────────────────────────────────────────────
  getForecast: async (lat, lon, units = 'metric') => {
    const owmReady = await isOWMReady();

    if (owmReady) {
      const res = await axios.get(`${OWM_BASE}/data/2.5/forecast`, {
        params: { lat, lon, units, appid: OWM_KEY, cnt: 40 }
      });
      // Normalize descriptions
      res.data.list?.forEach(item => {
        if (item.weather?.[0]) item.weather[0].description = titleCase(item.weather[0].description);
      });
      return res.data;
    }

    // ── Open-Meteo hourly fallback ───────────────────────────────────────────
    const isMetric = units === 'metric';
    const res = await axios.get(OPEN_METEO, {
      params: {
        latitude: lat, longitude: lon,
        hourly: [
          'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
          'weather_code', 'wind_speed_10m', 'precipitation_probability',
          'precipitation', 'visibility', 'is_day'
        ].join(','),
        timezone: 'auto',
        temperature_unit: isMetric ? 'celsius' : 'fahrenheit',
        wind_speed_unit: isMetric ? 'ms' : 'mph',
        forecast_days: 6
      }
    });

    const h = res.data.hourly;
    const list = [];
    for (let i = 0; i < h.time.length && list.length < 40; i += 3) {
      const hour = new Date(h.time[i]).getHours();
      const cond = mapWMO(h.weather_code[i], h.is_day?.[i] ?? (hour >= 6 && hour <= 20 ? 1 : 0));
      list.push({
        dt: Math.floor(new Date(h.time[i]).getTime() / 1000),
        dt_txt: h.time[i].replace('T', ' ') + ':00',
        main: {
          temp: Math.round(h.temperature_2m[i] * 10) / 10,
          feels_like: Math.round((h.apparent_temperature?.[i] ?? h.temperature_2m[i]) * 10) / 10,
          humidity: h.relative_humidity_2m[i]
        },
        weather: [{ main: cond.main, description: cond.desc, icon: cond.icon }],
        wind: { speed: h.wind_speed_10m[i] },
        pop: (h.precipitation_probability[i] || 0) / 100,
        rain: h.precipitation[i] ? { '3h': h.precipitation[i] } : undefined
      });
    }
    return { list };
  },

  // ── Air Quality Index ─────────────────────────────────────────────────────
  getAirPollution: async (lat, lon) => {
    const owmReady = await isOWMReady();

    if (owmReady) {
      try {
        const res = await axios.get(`${OWM_BASE}/data/2.5/air_pollution`, {
          params: { lat, lon, appid: OWM_KEY }
        });
        return res.data;
      } catch { /* fall through */ }
    }

    // ── Open-Meteo Air Quality fallback ──────────────────────────────────────
    try {
      const res = await axios.get(AIR_METEO, {
        params: {
          latitude: lat, longitude: lon,
          current: ['european_aqi', 'pm2_5', 'pm10', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone'].join(','),
          timezone: 'auto'
        }
      });
      const aqi = res.data.current?.european_aqi ?? 0;
      // Map EU AQI (0–500) → OWM AQI (1–5)
      let mapped = 1;
      if (aqi > 20)  mapped = 2;
      if (aqi > 40)  mapped = 3;
      if (aqi > 60)  mapped = 4;
      if (aqi > 80)  mapped = 5;
      return {
        list: [{
          main: { aqi: mapped },
          components: {
            pm2_5: res.data.current?.pm2_5,
            pm10:  res.data.current?.pm10,
            no2:   res.data.current?.nitrogen_dioxide,
            o3:    res.data.current?.ozone,
            co:    res.data.current?.carbon_monoxide,
          }
        }]
      };
    } catch {
      return { list: [{ main: { aqi: 1 }, components: {} }] };
    }
  },

  // ── UV Index standalone (Open-Meteo, no key needed) ──────────────────────
  getUVIndex: async (lat, lon) => {
    try {
      const res = await axios.get(OPEN_METEO, {
        params: {
          latitude: lat, longitude: lon,
          daily: 'uv_index_max',
          timezone: 'auto',
          forecast_days: 1
        }
      });
      return res.data.daily?.uv_index_max?.[0] ?? null;
    } catch {
      return null;
    }
  }
};
