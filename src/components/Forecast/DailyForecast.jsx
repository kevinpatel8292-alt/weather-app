import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { format } from 'date-fns';

const DailyForecast = () => {
  const { forecast, loading } = useWeatherContext();

  if (loading || !forecast) {
    return (
      <div className="glass-panel mt-6">
        <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: '50px', borderRadius: '0.5rem' }}></div>
          ))}
        </div>
      </div>
    );
  }

  // Group by day for 5-day forecast
  const dailyData = [];
  const groupedData = {};

  forecast.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!groupedData[date]) {
      groupedData[date] = [];
    }
    groupedData[date].push(item);
  });

  Object.keys(groupedData).slice(0, 5).forEach(date => {
    const dayData = groupedData[date];
    const temps = dayData.map(d => d.main.temp);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    // Get weather icon from midday if possible, else first
    const middayData = dayData.find(d => d.dt_txt.includes('12:00:00')) || dayData[0];
    const rainProb = Math.max(...dayData.map(d => d.pop || 0)) * 100;

    dailyData.push({
      date,
      maxTemp,
      minTemp,
      icon: middayData.weather[0].icon,
      condition: middayData.weather[0].main,
      rainProb
    });
  });

  return (
    <div className="glass-panel mt-6">
      <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
      <div className="flex flex-col gap-4">
        {dailyData.map((day, index) => {
          const dateStr = index === 0 ? 'Today' : format(new Date(day.date), 'EEEE');
          const iconUrl = `https://openweathermap.org/img/wn/${day.icon}.png`;

          return (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium w-24">{dateStr}</span>
              
              <div className="flex items-center gap-2 w-24">
                <img src={iconUrl} alt={day.condition} style={{ width: '40px', height: '40px' }} />
                <span className="text-sm text-primary font-medium">{Math.round(day.rainProb)}%</span>
              </div>
              
              <div className="flex items-center gap-4 w-32 justify-end">
                <span className="font-bold">{Math.round(day.maxTemp)}°</span>
                <span className="text-muted">{Math.round(day.minTemp)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;
