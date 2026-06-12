import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { weatherApi } from '../utils/weatherApi';
import { useGeolocation } from '../hooks/useGeolocation';

const WeatherContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWeatherContext = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }) => {
  // Preferences
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [unit, setUnit] = useState(localStorage.getItem('unit') || 'metric');
  
  // Favorites
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Current selected location
  const [currentLocation, setCurrentLocation] = useState({ lat: 51.5074, lon: -0.1278, name: 'London' }); // Default London

  // Weather Data State
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airPollution, setAirPollution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { location: geoLoc, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

  // Effects for Preferences
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('unit', unit);
    if (currentLocation) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon, currentLocation.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Effect for Geolocation — geoLoc.name is now the real reverse-geocoded city name
  useEffect(() => {
    if (geoLoc) {
      fetchWeatherData(geoLoc.lat, geoLoc.lon, geoLoc.name || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLoc]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'metric' ? 'imperial' : 'metric');
  };

  const addFavorite = (city) => {
    if (!favorites.find(f => f.lat === city.lat && f.lon === city.lon)) {
      setFavorites([...favorites, city]);
    }
  };

  const removeFavorite = (lat, lon) => {
    setFavorites(favorites.filter(f => f.lat !== lat || f.lon !== lon));
  };

  const isFavorite = (lat, lon) => {
    return favorites.some(f => f.lat === lat && f.lon === lon);
  };

  const searchCity = async (cityQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getCoordinates(cityQuery);
      if (data && data.length > 0) {
        const { lat, lon, name, state, country } = data[0];
        const fullName = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;
        await fetchWeatherData(lat, lon, fullName);
      } else {
        setError('City not found. Please try again.');
      }
    } catch (_err) {
      setError('Failed to search city.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = useCallback(async (lat, lon, name) => {
    setLoading(true);
    setError(null);
    try {
      const [weather, forecastData, airData] = await Promise.all([
        weatherApi.getCurrentWeather(lat, lon, unit),
        weatherApi.getForecast(lat, lon, unit),
        weatherApi.getAirPollution(lat, lon)
      ]);

      setCurrentWeather(weather);
      setForecast(forecastData);
      setAirPollution(airData);
      setCurrentLocation({ lat, lon, name: name || weather.name });
    } catch (_err) {
      setError('Failed to fetch weather data. Please check your API key and connection.');
    } finally {
      setLoading(false);
    }
  }, [unit]);

  // Initial load
  useEffect(() => {
    if (!currentWeather) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon, currentLocation.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-refresh every 10 minutes (like Google Weather) ─────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLocation?.lat) {
        fetchWeatherData(currentLocation.lat, currentLocation.lon, currentLocation.name);
      }
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  const value = {
    theme,
    toggleTheme,
    unit,
    toggleUnit,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    currentLocation,
    currentWeather,
    forecast,
    airPollution,
    loading: loading || geoLoading,
    error: error || geoError,
    searchCity,
    fetchWeatherData,
    getLocation
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};
