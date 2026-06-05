import React, { useEffect, useState } from 'react';
import { WeatherProvider, useWeatherContext } from './context/WeatherContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import CurrentWeather from './components/Dashboard/CurrentWeather';
import WeatherHighlights from './components/Dashboard/WeatherHighlights';
import HourlyForecast from './components/Forecast/HourlyForecast';
import DailyForecast from './components/Forecast/DailyForecast';
import AirQuality from './components/Dashboard/AirQuality';
import WeatherCharts from './components/Charts/WeatherCharts';

const MainApp = () => {
  const { currentWeather, error } = useWeatherContext();
  const [bgClass, setBgClass] = useState('bg-default');

  useEffect(() => {
    if (currentWeather) {
      const condition = currentWeather.weather[0].main.toLowerCase();
      if (condition.includes('clear')) {
        setBgClass('bg-sunny');
      } else if (condition.includes('rain') || condition.includes('drizzle')) {
        setBgClass('bg-rainy');
      } else if (condition.includes('cloud')) {
        setBgClass('bg-cloudy');
      } else if (condition.includes('snow')) {
        setBgClass('bg-snowy');
      } else if (condition.includes('thunderstorm')) {
        setBgClass('bg-thunderstorm');
      } else {
        setBgClass('bg-default');
      }
    }
  }, [currentWeather]);

  // Apply background to body or root container
  useEffect(() => {
    document.body.className = `${document.documentElement.className} ${bgClass}`;
  }, [bgClass]);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        
        {error && (
          <div className="glass-panel bg-red-500/20 border-red-500/50 text-red-100 mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CurrentWeather />
            <HourlyForecast />
            <WeatherCharts />
          </div>
          <div className="lg:col-span-1">
            <DailyForecast />
            <AirQuality />
          </div>
        </div>
        
        <WeatherHighlights />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <WeatherProvider>
      <MainApp />
    </WeatherProvider>
  );
};

export default App;
