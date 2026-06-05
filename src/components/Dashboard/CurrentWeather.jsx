import React from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const CurrentWeather = () => {
  const { currentWeather, currentLocation, favorites, addFavorite, removeFavorite, loading } = useWeatherContext();

  if (loading || !currentWeather) {
    return <div className="glass-panel skeleton" style={{ height: '250px' }}></div>;
  }

  const isFav = favorites.some(f => f.lat === currentLocation.lat && f.lon === currentLocation.lon);

  const toggleFav = () => {
    if (isFav) {
      removeFavorite(currentLocation.lat, currentLocation.lon);
    } else {
      addFavorite(currentLocation);
    }
  };

  const { weather, main } = currentWeather;
  const condition = weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${condition.icon}@4x.png`;
  const currentDate = format(new Date(), 'EEEE, d MMMM yyyy | h:mm a');

  return (
    <div className="glass-panel flex flex-col justify-between" style={{ minHeight: '250px' }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={20} className="text-primary" />
            <h2 className="text-2xl font-bold">{currentLocation.name}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar size={14} />
            <p>{currentDate}</p>
          </div>
        </div>
        
        <button 
          className="btn-icon glass-card"
          onClick={toggleFav}
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={20} className={isFav ? "text-danger" : ""} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center">
          <h1 className="text-6xl font-bold">{Math.round(main.temp)}°</h1>
          <div className="ml-4 flex flex-col justify-center">
            <span className="text-xl font-medium capitalize">{condition.description}</span>
            <span className="text-sm text-muted">Feels like {Math.round(main.feels_like)}°</span>
          </div>
        </div>
        
        <div className="hidden sm:block">
          <img src={iconUrl} alt={condition.description} style={{ width: '120px', height: '120px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
