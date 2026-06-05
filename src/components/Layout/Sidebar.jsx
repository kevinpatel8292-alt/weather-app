import React from 'react';
import { CloudRain, MapPin, Trash2 } from 'lucide-react';
import { useWeatherContext } from '../../context/WeatherContext';

const Sidebar = () => {
  const { favorites, removeFavorite, fetchWeatherData } = useWeatherContext();

  return (
    <aside className="sidebar glass-panel flex flex-col gap-6" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
      <div className="flex items-center gap-2 text-primary">
        <CloudRain size={32} />
        <h1 className="text-2xl font-bold">WeatherSphere</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-sm text-muted font-semibold mb-4 uppercase tracking-wider">Favorite Cities</h2>
        
        {favorites.length === 0 ? (
          <p className="text-sm text-muted">No favorite cities added yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {favorites.map((city, index) => (
              <div 
                key={index}
                className="glass-card flex justify-between items-center cursor-pointer hover:border-primary-color transition-colors"
                style={{ padding: '0.75rem', flexDirection: 'row' }}
                onClick={() => fetchWeatherData(city.lat, city.lon, city.name)}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="font-medium text-sm truncate max-w-[120px]">{city.name}</span>
                </div>
                <button 
                  className="btn-icon" 
                  style={{ padding: '0.25rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(city.lat, city.lon);
                  }}
                >
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted text-center mt-auto pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <p>B.Tech IT ReactJS Project</p>
        <p>&copy; 2026 WeatherSphere</p>
      </div>
    </aside>
  );
};

export default Sidebar;
