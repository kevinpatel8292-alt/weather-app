/**
 * Geocoding API wrapper using native Promises (fetch + .then)
 * Resolves with city coordinates or rejects if invalid/empty
 */
export function getCoordinatesPromise(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (!data.results || data.results.length === 0) {
          reject(new Error(`City "${cityName}" not found`));
        } else {
          const result = data.results[0];
          resolve({
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
            country: result.country,
            countryCode: result.country_code,
            admin1: result.admin1 // State or Region
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Weather Forecast API wrapper using async/await syntax
 * Fetches current weather, hourly indicators, and daily trends
 */
export async function getWeatherDataAsync(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  const data = await response.json();
  
  // Find current hour index to extract matching hourly variables
  const currentHourIndex = new Date().getHours();
  
  const humidity = data.hourly?.relativehumidity_2m?.[currentHourIndex] || data.hourly?.relativehumidity_2m?.[0] || 0;
  const apparentTemp = data.hourly?.apparent_temperature?.[currentHourIndex] || data.hourly?.apparent_temperature?.[0] || data.current_weather.temperature;
  const precipProb = data.hourly?.precipitation_probability?.[currentHourIndex] || data.hourly?.precipitation_probability?.[0] || 0;
  
  // Format the 5-day daily forecast
  const dailyForecast = [];
  if (data.daily) {
    const limit = Math.min(data.daily.time.length, 5);
    for (let i = 0; i < limit; i++) {
      dailyForecast.push({
        date: data.daily.time[i],
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weathercode[i],
        uvIndex: data.daily.uv_index_max?.[i] || 0
      });
    }
  }

  return {
    current: {
      temp: Math.round(data.current_weather.temperature),
      windSpeed: Math.round(data.current_weather.windspeed),
      windDirection: data.current_weather.winddirection,
      weatherCode: data.current_weather.weathercode,
      isDay: data.current_weather.is_day,
      humidity,
      apparentTemp: Math.round(apparentTemp),
      precipitationProbability: precipProb
    },
    forecast: dailyForecast
  };
}

/**
 * Helper mapping Open-Meteo weather codes to styling categories, descriptions, and emojis.
 */
export function getWeatherDetails(code, isDay = 1) {
  const mapping = {
    0: { label: 'Clear Sky', emoji: isDay ? '☀️' : '🌙', category: 'clear' },
    1: { label: 'Mainly Clear', emoji: isDay ? '🌤️' : '🌙', category: 'clear' },
    2: { label: 'Partly Cloudy', emoji: '⛅', category: 'cloudy' },
    3: { label: 'Overcast', emoji: '☁️', category: 'cloudy' },
    45: { label: 'Foggy', emoji: '🌫️', category: 'cloudy' },
    48: { label: 'Rime Fog', emoji: '🌫️', category: 'cloudy' },
    51: { label: 'Light Drizzle', emoji: '🌧️', category: 'rainy' },
    53: { label: 'Moderate Drizzle', emoji: '🌧️', category: 'rainy' },
    55: { label: 'Dense Drizzle', emoji: '🌧️', category: 'rainy' },
    56: { label: 'Light Freezing Drizzle', emoji: '❄️🌧️', category: 'snowy' },
    57: { label: 'Dense Freezing Drizzle', emoji: '❄️🌧️', category: 'snowy' },
    61: { label: 'Slight Rain', emoji: '🌦️', category: 'rainy' },
    63: { label: 'Moderate Rain', emoji: '🌧️', category: 'rainy' },
    65: { label: 'Heavy Rain', emoji: '🌧️', category: 'rainy' },
    66: { label: 'Light Freezing Rain', emoji: '❄️🌧️', category: 'snowy' },
    67: { label: 'Heavy Freezing Rain', emoji: '❄️🌧️', category: 'snowy' },
    71: { label: 'Slight Snowfall', emoji: '❄️', category: 'snowy' },
    73: { label: 'Moderate Snowfall', emoji: '❄️', category: 'snowy' },
    75: { label: 'Heavy Snowfall', emoji: '❄️', category: 'snowy' },
    77: { label: 'Snow Grains', emoji: '❄️', category: 'snowy' },
    80: { label: 'Light Rain Showers', emoji: '🌦️', category: 'rainy' },
    81: { label: 'Moderate Rain Showers', emoji: '🌧️', category: 'rainy' },
    82: { label: 'Violent Rain Showers', emoji: '🌧️', category: 'rainy' },
    85: { label: 'Slight Snow Showers', emoji: '❄️🌦️', category: 'snowy' },
    86: { label: 'Heavy Snow Showers', emoji: '❄️🌦️', category: 'snowy' },
    95: { label: 'Thunderstorm', emoji: '⛈️', category: 'stormy' },
    96: { label: 'Thunderstorm with Hail', emoji: '⛈️🌨️', category: 'stormy' },
    99: { label: 'Severe Thunderstorm & Hail', emoji: '⛈️🌨️', category: 'stormy' }
  };

  return mapping[code] || { label: 'Unknown Weather', emoji: '🌡️', category: 'clear' };
}
