import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Moon, Sun, Thermometer, Clock, X } from 'lucide-react';
import { useWeatherContext } from '../../context/WeatherContext';
import { weatherApi } from '../../utils/weatherApi';

const Header = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const { theme, toggleTheme, unit, toggleUnit, getLocation, fetchWeatherData } = useWeatherContext();
  const wrapperRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsLoading(true);
        try {
          const results = await weatherApi.getCoordinates(query.trim());
          setSuggestions(results);
        } catch (error) {
          console.error("Failed to fetch suggestions");
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (city) => {
    const newRecents = [city, ...recentSearches.filter(c => c.name !== city.name || c.country !== city.country)].slice(0, 5);
    setRecentSearches(newRecents);
    localStorage.setItem('recentSearches', JSON.stringify(newRecents));
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSelectCity = (city) => {
    fetchWeatherData(city.lat, city.lon, city.name);
    saveRecentSearch(city);
    setQuery('');
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (suggestions.length > 0) {
        handleSelectCity(suggestions[0]);
      } else {
        // Fallback if they hit enter before suggestions load
        try {
          setIsLoading(true);
          const results = await weatherApi.getCoordinates(query.trim());
          if (results.length > 0) {
            handleSelectCity(results[0]);
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <header className="flex justify-between items-center mb-6 gap-4 flex-wrap">
      <div className="flex-1 min-w-[280px] relative z-50" ref={wrapperRef}>
        <form onSubmit={handleSearch} className="search-input-wrapper relative">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search any city or country in the world..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-color border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </form>

        {/* Dropdown Menu */}
        {isFocused && (query.length > 2 || recentSearches.length > 0) && (
          <div className="absolute top-full left-0 w-full mt-2 glass-panel p-2 z-50 max-h-[300px] overflow-y-auto" style={{ borderRadius: '1rem' }}>
            
            {/* Suggestions list */}
            {query.length > 2 && suggestions.length > 0 && (
              <div className="mb-2">
                {suggestions.map((city, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleSelectCity(city)}
                  >
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-sm truncate">{city.name}</span>
                      <span className="text-xs text-muted truncate">{city.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length > 2 && suggestions.length === 0 && !isLoading && (
              <div className="p-4 text-center text-sm text-muted">
                No locations found. Try a different spelling.
              </div>
            )}

            {/* Recent Searches */}
            {query.length <= 2 && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Recent Searches</span>
                  <button onClick={clearRecentSearches} className="text-xs text-danger hover:underline flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                </div>
                {recentSearches.map((city, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleSelectCity(city)}
                  >
                    <Clock size={16} className="text-muted flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-sm truncate">{city.name}</span>
                      <span className="text-xs text-muted truncate">{city.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <button 
          className="btn-icon glass-panel" 
          onClick={getLocation}
          title="Current Location"
          style={{ padding: '0.5rem' }}
        >
          <MapPin size={20} />
        </button>

        <button 
          className="btn-icon glass-panel flex items-center gap-1" 
          onClick={toggleUnit}
          title="Toggle Unit"
          style={{ padding: '0.5rem 0.75rem', borderRadius: '1rem' }}
        >
          <Thermometer size={18} />
          <span className="font-semibold">{unit === 'metric' ? '°C' : '°F'}</span>
        </button>

        <button 
          className="btn-icon glass-panel" 
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{ padding: '0.5rem' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
