import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { format } from 'date-fns';

const DailyForecast = () => {
  const { forecast, loading } = useWeatherContext();

  if (loading || !forecast) {
    return (
      <div className="forecast-grid">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '1.25rem' }} />
        ))}
      </div>
    );
  }

  // Group by day
  const grouped = {};
  forecast.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const dailyData = Object.keys(grouped).slice(0, 5).map((date, index) => {
    const dayData = grouped[date];
    const temps = dayData.map(d => d.main.temp);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const midday = dayData.find(d => d.dt_txt.includes('12:00:00')) || dayData[0];
    return {
      date,
      maxTemp,
      minTemp,
      icon: midday.weather[0].icon,
      condition: midday.weather[0].main,
      description: midday.weather[0].description,
      rainProb: Math.round(Math.max(...dayData.map(d => d.pop || 0)) * 100),
      isToday: index === 0,
    };
  });

  return (
    <div className="forecast-grid">
      {dailyData.map((day, i) => {
        const dayName = day.isToday ? 'Today' : format(new Date(day.date), 'EEE');
        const dateStr = format(new Date(day.date), 'MMM d');
        const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

        return (
          <div key={i} className="forecast-day-card">
            <div className="forecast-day-name">{dayName}</div>
            <div className="forecast-day-date">{dateStr}</div>
            <img src={iconUrl} alt={day.condition} className="forecast-day-icon" />
            <div className="forecast-day-condition" style={{ textTransform: 'capitalize' }}>
              {day.description}
            </div>
            <div className="forecast-day-temps">
              <span className="hi">{Math.round(day.maxTemp)}°</span>
              <span className="lo">/ {Math.round(day.minTemp)}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyForecast;
