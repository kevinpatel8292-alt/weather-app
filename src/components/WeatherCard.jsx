import React from 'react';
import { getWeatherDetails } from '../services/weatherApi';

export default function WeatherCard({ weatherData, location }) {
  const current = weatherData.current;
  const details = getWeatherDetails(current.weatherCode, current.isDay);

  return (
    <>
      {/* Current Overview Card */}
      <section className="weather-card">
        <div className="weather-info">
          <h2 className="location-name">{location.name}</h2>
          <span className="location-region">
            {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
          </span>
          <div className="weather-condition">
            <span className="condition-emoji">{details.emoji}</span>
            <span className="condition-text">{details.label}</span>
          </div>
        </div>
        <div className="weather-temp">
          <span className="temp-value">{current.temp}°C</span>
          <span className="temp-feels-like">Feels like {current.apparentTemp}°C</span>
        </div>
      </section>

      {/* Detailed Metrics Panel */}
      <section className="metrics-panel">
        {/* Humidity */}
        <div className="metric-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="metric-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="metric-label">Humidity</span>
          <span className="metric-value">{current.humidity}%</span>
        </div>

        {/* Wind Speed */}
        <div className="metric-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="metric-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="metric-label">Wind</span>
          <span className="metric-value">{current.windSpeed} km/h</span>
        </div>

        {/* Precipitation Probability */}
        <div className="metric-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="metric-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="metric-label">Rain Chance</span>
          <span className="metric-value">{current.precipitationProbability}%</span>
        </div>
      </section>
    </>
  );
}
