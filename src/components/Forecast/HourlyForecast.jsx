import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { format } from 'date-fns';

const HourlyForecast = () => {
  const { forecast, loading } = useWeatherContext();

  if (loading || !forecast) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Forecast</h3>
        <div className="horizontal-scroll">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card skeleton" style={{ width: '100px', height: '140px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  // Get next 8 items (24 hours)
  const hourlyData = forecast.list.slice(0, 8);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Hourly Forecast</h3>
      <div className="horizontal-scroll">
        {hourlyData.map((item, index) => {
          const time = format(new Date(item.dt * 1000), 'h a');
          const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
          
          return (
            <div key={index} className="glass-card flex flex-col items-center min-w-[100px]">
              <span className="text-sm font-medium">{time}</span>
              <img src={iconUrl} alt={item.weather[0].description} style={{ width: '50px', height: '50px' }} />
              <span className="text-lg font-bold">{Math.round(item.main.temp)}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;
