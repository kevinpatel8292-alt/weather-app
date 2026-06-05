import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { Leaf } from 'lucide-react';

const AQI_DATA = {
  1: { label: 'Good', color: 'var(--success-color)', width: '20%' },
  2: { label: 'Fair', color: 'var(--info-color)', width: '40%' },
  3: { label: 'Moderate', color: 'var(--warning-color)', width: '60%' },
  4: { label: 'Poor', color: 'var(--accent-color)', width: '80%' },
  5: { label: 'Very Poor', color: 'var(--danger-color)', width: '100%' }
};

const AirQuality = () => {
  const { airPollution, loading } = useWeatherContext();

  if (loading || !airPollution) {
    return <div className="glass-panel skeleton mt-6" style={{ height: '120px' }}></div>;
  }

  const aqi = airPollution.list[0].main.aqi;
  const data = AQI_DATA[aqi] || AQI_DATA[1];

  return (
    <div className="glass-panel mt-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Leaf size={20} className="text-success" />
          <h3 className="text-lg font-semibold">Air Quality Index</h3>
        </div>
        <div className="text-xl font-bold" style={{ color: data.color }}>
          {data.label}
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-muted mt-4">
        <span>Good</span>
        <span>Hazardous</span>
      </div>
      <div className="aqi-bar-container">
        <div 
          className="aqi-bar" 
          style={{ 
            width: data.width, 
            backgroundColor: data.color,
            transition: 'width 1s ease-in-out'
          }}
        ></div>
      </div>
    </div>
  );
};

export default AirQuality;
