import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';

const getWindDir = (deg) => {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const CurrentWeather = () => {
  const { currentWeather, loading, unit, airPollution } = useWeatherContext();

  if (loading || !currentWeather) {
    return (
      <div className="glass-panel current-weather-panel">
        <div className="skeleton" style={{ height: '120px', borderRadius: '1rem', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '80px', borderRadius: '1rem', marginBottom: '1rem' }} />
        <div className="weather-stats-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '0.75rem' }} />
          ))}
        </div>
      </div>
    );
  }

  const { weather, main, wind, visibility } = currentWeather;
  const condition = weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${condition.icon}@4x.png`;
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  const aqi = airPollution?.list?.[0]?.main?.aqi;
  const aqiLabels = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor' };
  const aqiColors = { 1: '#10b981', 2: '#3b82f6', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };

  const uvIndex = 5; // placeholder (requires UV API)

  const stats = [
    { label: 'Precipitation', value: `${Math.round((currentWeather.rain?.['1h'] || 0) * 100) || Math.round(currentWeather.clouds?.all || 0)}`, unit: '%', sub: null },
    { label: 'Wind Speed', value: `${wind.speed}`, unit: speedUnit, sub: getWindDir(wind.deg) },
    { label: 'Humidity', value: `${main.humidity}`, unit: '%', sub: null },
    { label: 'UV Index', value: `${uvIndex}`, unit: '', sub: 'Moderate' },
    { label: 'Air Quality', value: aqi ? `${aqi * 10 + 25}` : '—', unit: '', sub: aqi ? aqiLabels[aqi] : '—', subColor: aqi ? aqiColors[aqi] : undefined },
    { label: 'Pressure', value: `${main.pressure}`, unit: ' hPa', sub: null },
  ];

  return (
    <div className="glass-panel current-weather-panel">
      {/* Top: icon + basic info */}
      <div className="current-weather-top">
        <img
          src={iconUrl}
          alt={condition.description}
          className="current-weather-icon"
        />
        <div className="current-weather-info">
          <div className="current-weather-condition-line">
            Sun: <span>{Math.round(main.temp_max ?? main.temp)}{tempUnit}</span>
          </div>
          <div className="current-weather-condition-line">
            Clouds: <span style={{ textTransform: 'capitalize' }}>{condition.description}</span>
          </div>

          <div className="current-weather-feels">Feels Like {Math.round(main.feels_like)}{tempUnit}</div>
          <div className="current-weather-temp">{Math.round(main.temp)}{tempUnit}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="weather-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {s.value}<span> {s.unit}</span>
            </div>
            {s.sub && (
              <div className="stat-sub" style={s.subColor ? { color: s.subColor } : {}}>
                {s.sub}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentWeather;
