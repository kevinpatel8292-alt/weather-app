import axios from 'axios';

// Map WMO weather codes to OpenWeather format
const mapWeatherCode = (code, isDay = 1) => {
  const d = isDay ? 'd' : 'n';
  const codes = {
    0: { main: 'Clear', desc: 'clear sky', icon: `01${d}` },
    1: { main: 'Clouds', desc: 'mainly clear', icon: `02${d}` },
    2: { main: 'Clouds', desc: 'partly cloudy', icon: `03${d}` },
    3: { main: 'Clouds', desc: 'overcast', icon: `04${d}` },
    45: { main: 'Fog', desc: 'fog', icon: `50${d}` },
    48: { main: 'Fog', desc: 'depositing rime fog', icon: `50${d}` },
    51: { main: 'Drizzle', desc: 'light drizzle', icon: `09${d}` },
    53: { main: 'Drizzle', desc: 'moderate drizzle', icon: `09${d}` },
    55: { main: 'Drizzle', desc: 'dense drizzle', icon: `09${d}` },
    56: { main: 'Drizzle', desc: 'light freezing drizzle', icon: `09${d}` },
    57: { main: 'Drizzle', desc: 'dense freezing drizzle', icon: `09${d}` },
    61: { main: 'Rain', desc: 'slight rain', icon: `10${d}` },
    63: { main: 'Rain', desc: 'moderate rain', icon: `10${d}` },
    65: { main: 'Rain', desc: 'heavy rain', icon: `10${d}` },
    66: { main: 'Rain', desc: 'light freezing rain', icon: `13${d}` },
    67: { main: 'Rain', desc: 'heavy freezing rain', icon: `13${d}` },
    71: { main: 'Snow', desc: 'slight snow fall', icon: `13${d}` },
    73: { main: 'Snow', desc: 'moderate snow fall', icon: `13${d}` },
    75: { main: 'Snow', desc: 'heavy snow fall', icon: `13${d}` },
    77: { main: 'Snow', desc: 'snow grains', icon: `13${d}` },
    80: { main: 'Rain', desc: 'slight rain showers', icon: `09${d}` },
    81: { main: 'Rain', desc: 'moderate rain showers', icon: `09${d}` },
    82: { main: 'Rain', desc: 'violent rain showers', icon: `09${d}` },
    85: { main: 'Snow', desc: 'slight snow showers', icon: `13${d}` },
    86: { main: 'Snow', desc: 'heavy snow showers', icon: `13${d}` },
    95: { main: 'Thunderstorm', desc: 'thunderstorm', icon: `11${d}` },
    96: { main: 'Thunderstorm', desc: 'thunderstorm with slight hail', icon: `11${d}` },
    99: { main: 'Thunderstorm', desc: 'thunderstorm with heavy hail', icon: `11${d}` }
  };
  return codes[code] || codes[0];
};

export const weatherApi = {
  // Get coordinates by city name (Using OpenStreetMap Nominatim for better search results)
  getCoordinates: async (city) => {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: city, format: 'json', limit: 5 }
      });
      if (res.data && res.data.length > 0) {
        return res.data.map(r => {
          // Extract the first meaningful part of the display name for the title, and the rest for context
          const parts = r.display_name.split(', ');
          const name = parts[0];
          const stateCountry = parts.slice(1).join(', ');
          
          return {
            name: name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            country: stateCountry, // Store the rest of the string for context
            state: ''
          };
        });
      }
      return [];
    } catch (error) {
      console.error("Geocoding Error:", error);
      throw error;
    }
  },

  // Get current weather by coordinates (Adapted from Open-Meteo to look like OpenWeather)
  getCurrentWeather: async (lat, lon, units = 'metric') => {
    try {
      const isMetric = units === 'metric';
      
      // Fetch reverse geocoding to get city name for exact coordinates
      let cityName = 'Unknown Location';
      try {
        const geoRes = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client`, {
          params: { latitude: lat, longitude: lon, localityLanguage: 'en' }
        });
        cityName = geoRes.data.city || geoRes.data.locality || geoRes.data.principalSubdivision || 'Unknown Location';
      } catch (e) {
        console.error("Reverse Geocoding failed", e);
      }

      const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
          daily: 'sunrise,sunset',
          timezone: 'auto',
          temperature_unit: isMetric ? 'celsius' : 'fahrenheit',
          wind_speed_unit: isMetric ? 'ms' : 'mph'
        }
      });

      const current = res.data.current;
      const daily = res.data.daily;
      const weatherCondition = mapWeatherCode(current.weather_code, current.is_day);

      return {
        weather: [{ main: weatherCondition.main, description: weatherCondition.desc, icon: weatherCondition.icon }],
        main: {
          temp: current.temperature_2m,
          feels_like: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          pressure: current.pressure_msl,
        },
        visibility: 10000, // Open-Meteo current visibility is not standard in the free base tier, mock safe default
        wind: { speed: current.wind_speed_10m, deg: current.wind_direction_10m },
        sys: {
          sunrise: new Date(daily.sunrise[0]).getTime() / 1000,
          sunset: new Date(daily.sunset[0]).getTime() / 1000,
        },
        name: cityName,
        dt: current.time
      };
    } catch (error) {
      console.error("Current Weather Error:", error);
      throw error;
    }
  },

  // Get forecast by coordinates (Adapted from Open-Meteo)
  getForecast: async (lat, lon, units = 'metric') => {
    try {
      const isMetric = units === 'metric';
      const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability',
          timezone: 'auto',
          temperature_unit: isMetric ? 'celsius' : 'fahrenheit',
          wind_speed_unit: isMetric ? 'ms' : 'mph',
          forecast_days: 6 // Request 6 to ensure we have enough full days
        }
      });

      const hourly = res.data.hourly;
      const list = [];

      // Open-Meteo gives 24 items per day. OpenWeather gave 1 every 3 hours.
      // We will sample every 3 hours to match the 40 items expected by the app.
      for (let i = 0; i < hourly.time.length && list.length < 40; i += 3) {
        // Determine day/night based on hour for icons
        const hour = new Date(hourly.time[i]).getHours();
        const isDay = hour >= 6 && hour <= 18 ? 1 : 0;
        const weatherCondition = mapWeatherCode(hourly.weather_code[i], isDay);

        list.push({
          dt: new Date(hourly.time[i]).getTime() / 1000,
          dt_txt: hourly.time[i].replace('T', ' ') + ':00',
          main: {
            temp: hourly.temperature_2m[i],
            humidity: hourly.relative_humidity_2m[i],
          },
          weather: [{ main: weatherCondition.main, description: weatherCondition.desc, icon: weatherCondition.icon }],
          wind: { speed: hourly.wind_speed_10m[i] },
          pop: hourly.precipitation_probability[i] / 100 // Convert percentage to 0-1
        });
      }

      return { list };
    } catch (error) {
      console.error("Forecast Error:", error);
      throw error;
    }
  },

  // Get Air Pollution data
  getAirPollution: async (lat, lon) => {
    try {
      const res = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'european_aqi',
          timezone: 'auto'
        }
      });

      // European AQI mapping: 0-20=Good(1), 20-40=Fair(2), 40-60=Moderate(3), 60-80=Poor(4), >80=Very Poor(5)
      const aqiValue = res.data.current.european_aqi;
      let mappedAqi = 1;
      if (aqiValue > 20) mappedAqi = 2;
      if (aqiValue > 40) mappedAqi = 3;
      if (aqiValue > 60) mappedAqi = 4;
      if (aqiValue > 80) mappedAqi = 5;

      return {
        list: [
          {
            main: { aqi: mappedAqi }
          }
        ]
      };
    } catch (error) {
      console.error("Air Quality Error:", error);
      return { list: [{ main: { aqi: 1 } }] }; // Fallback
    }
  }
};
