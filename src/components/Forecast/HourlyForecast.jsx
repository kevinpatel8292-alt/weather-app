import React, { useRef } from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { format } from 'date-fns';

const HourlyForecast = () => {
  const { forecast, loading } = useWeatherContext();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  if (loading || !forecast) {
    return (
      <div className="glass-panel hourly-section" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="hourly-header">
          <span className="hourly-title">Hour-By-Hour</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1.25rem 1rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ width: '60px', height: '90px', borderRadius: '0.75rem', flexShrink: 0 }} />
          ))}
        </div>
      </div>
    );
  }

  const hourlyData = forecast.list.slice(0, 8);

  // Get min/max temp for chart normalization
  const temps = hourlyData.map(d => d.main.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  // Build SVG path for temperature line
  const itemWidth = 70;
  const chartH = 28;
  const chartW = hourlyData.length * itemWidth;
  const points = hourlyData.map((d, i) => {
    const x = i * itemWidth + itemWidth / 2;
    const y = chartH - ((d.main.temp - minT) / range) * (chartH - 6) - 3;
    return `${x},${y}`;
  });
  const polyline = points.join(' ');

  return (
    <div className="glass-panel hourly-section" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div className="hourly-header">
        <span className="hourly-title">Hour-By-Hour</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="hourly-nav-btn" onClick={() => scroll(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="hourly-nav-btn" onClick={() => scroll(1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="hourly-scroll" ref={scrollRef}>
        {hourlyData.map((item, i) => {
          const time = format(new Date(item.dt * 1000), 'h a');
          const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
          return (
            <div key={i} className="hourly-item">
              <img src={iconUrl} alt={item.weather[0].description} className="hourly-item-icon" />
              <div className="hourly-item-temp">{Math.round(item.main.temp)}°</div>
              <div className="hourly-item-time">{time}</div>
            </div>
          );
        })}
      </div>

      {/* SVG temperature line */}
      <div className="hourly-chart-wrapper">
        <svg
          width="100%"
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <polyline
            points={polyline}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {hourlyData.map((_, i) => {
            const [x, y] = points[i].split(',').map(Number);
            return <circle key={i} cx={x} cy={y} r="3.5" fill="rgba(255,255,255,0.85)" />;
          })}
        </svg>
      </div>
      <div style={{ height: '0.75rem' }} />
    </div>
  );
};

export default HourlyForecast;
