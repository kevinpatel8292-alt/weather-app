import React, { useEffect, useState } from 'react';
import { WeatherProvider, useWeatherContext } from './context/WeatherContext';
import TopNav from './components/Layout/TopNav';
import CurrentWeather from './components/Dashboard/CurrentWeather';
import DailyForecast from './components/Forecast/DailyForecast';
import HourlyForecast from './components/Forecast/HourlyForecast';

const MainApp = () => {
  const { currentWeather, error } = useWeatherContext();
  const [bgClass, setBgClass] = useState('bg-default');

  useEffect(() => {
    if (currentWeather) {
      const condition = currentWeather.weather[0].main.toLowerCase();
      if (condition.includes('clear')) setBgClass('bg-sunny');
      else if (condition.includes('rain') || condition.includes('drizzle')) setBgClass('bg-rainy');
      else if (condition.includes('cloud')) setBgClass('bg-cloudy');
      else if (condition.includes('snow')) setBgClass('bg-snowy');
      else if (condition.includes('thunderstorm')) setBgClass('bg-thunderstorm');
      else setBgClass('bg-default');
    }
  }, [currentWeather]);

  useEffect(() => {
    document.body.className = bgClass;
  }, [bgClass]);

  return (
    <div className="atmos-app">
      {/* Animated sky background layer */}
      <div className="atmos-sky-bg" aria-hidden="true">
        <div className="sky-blob sky-blob--1" />
        <div className="sky-blob sky-blob--2" />
        <div className="sky-blob sky-blob--3" />
        <div className="sky-blob sky-blob--4" />
        <div className="sky-streak" />
        <div className="sky-cloud sky-cloud--1" />
        <div className="sky-cloud sky-cloud--2" />
      </div>
      <TopNav />
      <main className="atmos-dashboard">
        {error && (
          <div className="error-banner">{error}</div>
        )}

        {/* Brand Row */}
        <BrandRow />

        {/* Main grid: left = current weather | right = daily forecast */}
        <div className="dashboard-grid">
          <CurrentWeather />
          <div className="right-column">
            <DailyForecast />
            <HourlyForecast />
          </div>
        </div>
      </main>
    </div>
  );
};

const BrandRow = () => {
  const { currentLocation, theme, toggleTheme, unit, toggleUnit, getLocation, loading } = useWeatherContext();

  const now = new Date();
  const timeStr = now.toLocaleString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    weekday: 'short', month: 'short', day: 'numeric'
  });

  return (
    <div className="dashboard-brand-row">
      <div className="dashboard-brand">🌤 Atmos</div>
      <div className="dashboard-location-group">
        <div className="dashboard-location-name">{currentLocation?.name || 'Loading...'}</div>
        <div className="dashboard-location-time">{timeStr}</div>
      </div>
      <div className="dashboard-brand-actions">
        <button className="unit-btn" onClick={toggleUnit} title="Toggle unit">
          {unit === 'metric' ? '°C' : '°F'}
        </button>
        <button
          className={`icon-btn ${loading ? 'icon-btn--locating' : ''}`}
          onClick={getLocation}
          title="Use my live location"
          disabled={loading}
          style={{ position: 'relative' }}
        >
          {loading ? (
            /* Radar-style pulsing ping while locating */
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{
                position: 'absolute', width: 28, height: 28, borderRadius: '50%',
                border: '2px solid rgba(99,179,237,0.7)',
                animation: 'locatePing 1s ease-out infinite'
              }}/>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#63b3ed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
              </svg>
            </span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
          )}
        </button>
        <button
          className={`icon-btn ${theme === 'light' ? 'active' : ''}`}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ position: 'relative' }}
        >
          {theme === 'dark'
            ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <WeatherProvider>
    <MainApp />
  </WeatherProvider>
);

export default App;
