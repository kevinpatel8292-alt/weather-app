import React from 'react';
import { getWeatherDetails } from '../services/weatherApi';

export default function ForecastCard({ forecast }) {
  const getDayName = (dateStr, index) => {
    if (index === 0) return 'Today';
    const date = new Date(dateStr);
    // Force UTC parsing to avoid timezone shift inconsistencies on date rendering
    return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  };

  return (
    <section className="forecast-panel">
      <h3>5-Day Forecast</h3>
      <div className="forecast-list">
        {forecast.map((item, index) => {
          const details = getWeatherDetails(item.weatherCode);
          return (
            <div key={item.date} className="forecast-row">
              <span className="forecast-day">{getDayName(item.date, index)}</span>
              <div className="forecast-weather">
                <span className="forecast-emoji">{details.emoji}</span>
                <span className="forecast-label">{details.label}</span>
              </div>
              <div className="forecast-temps">
                <span className="temp-max">{item.tempMax}°C</span>
                <span className="temp-min">{item.tempMin}°C</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
