import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { Wind, Droplets, Gauge, Eye, Sunrise, Sunset } from 'lucide-react';
import { format } from 'date-fns';

const HighlightCard = ({ title, value, unit, icon: Icon, description }) => (
  <div className="glass-card">
    <div className="flex items-center gap-2 mb-4 text-muted self-start">
      <Icon size={16} />
      <span className="text-sm font-medium">{title}</span>
    </div>
    <div className="text-3xl font-bold mb-1 self-start">
      {value} <span className="text-xl font-medium">{unit}</span>
    </div>
    {description && <div className="text-xs text-muted mt-auto self-start">{description}</div>}
  </div>
);

const WeatherHighlights = () => {
  const { currentWeather, loading, unit } = useWeatherContext();

  if (loading || !currentWeather) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card skeleton" style={{ height: '140px' }}></div>
        ))}
      </div>
    );
  }

  const { main, wind, visibility, sys } = currentWeather;
  
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';
  const visibilityKm = (visibility / 1000).toFixed(1);
  
  // Format sunrise and sunset (sys times are in unix seconds)
  const formatTime = (unixTime) => {
    return format(new Date(unixTime * 1000), 'h:mm a');
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Today's Highlights</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <HighlightCard 
          title="Humidity" 
          value={main.humidity} 
          unit="%" 
          icon={Droplets}
          description="Current humidity level"
        />
        <HighlightCard 
          title="Wind Speed" 
          value={wind.speed} 
          unit={speedUnit} 
          icon={Wind}
          description={`Direction: ${wind.deg}°`}
        />
        <HighlightCard 
          title="Pressure" 
          value={main.pressure} 
          unit="hPa" 
          icon={Gauge}
          description="Atmospheric pressure"
        />
        <HighlightCard 
          title="Visibility" 
          value={visibilityKm} 
          unit="km" 
          icon={Eye}
          description="Distance visibility"
        />
        <HighlightCard 
          title="Sunrise" 
          value={formatTime(sys.sunrise)} 
          unit="" 
          icon={Sunrise}
        />
        <HighlightCard 
          title="Sunset" 
          value={formatTime(sys.sunset)} 
          unit="" 
          icon={Sunset}
        />
      </div>
    </div>
  );
};

export default WeatherHighlights;
