import React, { useState, useEffect, useRef } from 'react';
import { useWeatherContext } from '../../context/WeatherContext';
import { weatherApi } from '../../utils/weatherApi';

/* ─── Country code → flag emoji ─────────────────────────────────── */
const flag = (code) => {
  if (!code || code.length !== 2) return '🌍';
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
};

/* ─── Popular world cities shown by default ─────────────────────── */
const POPULAR_CITIES = [
  { name: 'Chikhli',      state: 'Navsari, Gujarat', country: 'IN', lat: 20.7566,  lon: 72.9982  },
  { name: 'New York',     state: 'NY',            country: 'US', lat: 40.7128,  lon: -74.0060 },
  { name: 'London',       state: 'England',        country: 'GB', lat: 51.5074,  lon: -0.1278  },
  { name: 'Tokyo',        state: 'Tokyo',          country: 'JP', lat: 35.6762,  lon: 139.6503 },
  { name: 'Paris',        state: 'Île-de-France',  country: 'FR', lat: 48.8566,  lon: 2.3522   },
  { name: 'Dubai',        state: 'Dubai',          country: 'AE', lat: 25.2048,  lon: 55.2708  },
  { name: 'Mumbai',       state: 'Maharashtra',    country: 'IN', lat: 19.0760,  lon: 72.8777  },
  { name: 'Sydney',       state: 'NSW',            country: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Singapore',    state: '',               country: 'SG', lat: 1.3521,   lon: 103.8198 },
  { name: 'Toronto',      state: 'Ontario',        country: 'CA', lat: 43.6532,  lon: -79.3832 },
  { name: 'Berlin',       state: 'Berlin',         country: 'DE', lat: 52.5200,  lon: 13.4050  },
  { name: 'Los Angeles',  state: 'CA',             country: 'US', lat: 34.0522,  lon: -118.2437},
  { name: 'Shanghai',     state: 'Shanghai',       country: 'CN', lat: 31.2304,  lon: 121.4737 },
  { name: 'Cairo',        state: 'Cairo',          country: 'EG', lat: 30.0444,  lon: 31.2357  },
  { name: 'São Paulo',    state: 'SP',             country: 'BR', lat: -23.5505, lon: -46.6333 },
  { name: 'Istanbul',     state: 'Istanbul',       country: 'TR', lat: 41.0082,  lon: 28.9784  },
  { name: 'Mexico City',  state: 'CDMX',           country: 'MX', lat: 19.4326,  lon: -99.1332 },
  { name: 'Bangkok',      state: 'Bangkok',        country: 'TH', lat: 13.7563,  lon: 100.5018 },
  { name: 'Delhi',        state: 'Delhi',          country: 'IN', lat: 28.7041,  lon: 77.1025  },
  { name: 'Moscow',       state: 'Moscow',         country: 'RU', lat: 55.7558,  lon: 37.6176  },
  { name: 'Seoul',        state: 'Seoul',          country: 'KR', lat: 37.5665,  lon: 126.9780 },
  { name: 'Karachi',      state: 'Sindh',          country: 'PK', lat: 24.8607,  lon: 67.0011  },
  { name: 'Lagos',        state: 'Lagos',          country: 'NG', lat: 6.5244,   lon: 3.3792   },
  { name: 'Jakarta',      state: 'Jakarta',        country: 'ID', lat: -6.2088,  lon: 106.8456 },
  { name: 'Dhaka',        state: 'Dhaka',          country: 'BD', lat: 23.8103,  lon: 90.4125  },
  { name: 'Ahmedabad',    state: 'Gujarat',        country: 'IN', lat: 23.0225,  lon: 72.5714  },
  { name: 'Surat',        state: 'Gujarat',        country: 'IN', lat: 21.1702,  lon: 72.8311  },
  { name: 'Chicago',      state: 'IL',             country: 'US', lat: 41.8781,  lon: -87.6298 },
  { name: 'Riyadh',       state: 'Riyadh',         country: 'SA', lat: 24.7136,  lon: 46.6753  },
  { name: 'Rome',         state: 'Lazio',          country: 'IT', lat: 41.9028,  lon: 12.4964  },
  { name: 'Amsterdam',    state: 'NH',             country: 'NL', lat: 52.3676,  lon: 4.9041   },
  { name: 'Barcelona',    state: 'Catalonia',      country: 'ES', lat: 41.3851,  lon: 2.1734   },
  { name: 'Cape Town',    state: 'WC',             country: 'ZA', lat: -33.9249, lon: 18.4241  },
  { name: 'Nairobi',      state: 'Nairobi',        country: 'KE', lat: -1.2921,  lon: 36.8219  },
  { name: 'Toronto',      state: 'Ontario',        country: 'CA', lat: 43.6532,  lon: -79.3832 },
  { name: 'Kuala Lumpur', state: 'KL',             country: 'MY', lat: 3.1390,   lon: 101.6869 },
  { name: 'Buenos Aires', state: 'CABA',           country: 'AR', lat: -34.6037, lon: -58.3816 },
  { name: 'Colombo',      state: 'Western',        country: 'LK', lat: 6.9271,   lon: 79.8612  },
  { name: 'Lahore',       state: 'Punjab',         country: 'PK', lat: 31.5204,  lon: 74.3587  },
  { name: 'Guangzhou',    state: 'Guangdong',      country: 'CN', lat: 23.1291,  lon: 113.2644 },
  { name: 'Ho Chi Minh',  state: 'HCM',            country: 'VN', lat: 10.8231,  lon: 106.6297 },
];

/* ─── My Places Drawer ─────────────────────────────────────────── */
const MyPlacesDrawer = ({ open, onClose }) => {
  const { favorites, addFavorite, removeFavorite, fetchWeatherData } = useWeatherContext();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose(); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length > 2) {
        setSearching(true);
        try { setSuggestions(await weatherApi.getCoordinates(search.trim())); }
        catch { setSuggestions([]); }
        finally { setSearching(false); }
      } else { setSuggestions([]); }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddPlace = (city) => {
    addFavorite({ lat: city.lat, lon: city.lon, name: city.name, country: city.country || '' });
    setSearch(''); setSuggestions([]);
  };

  const handleGoToPlace = (city) => { fetchWeatherData(city.lat, city.lon, city.name); onClose(); };
  const isSaved = (city) => favorites.some(f => f.lat === city.lat && f.lon === city.lon);

  return (
    <>
      <div className={`places-backdrop ${open ? 'places-backdrop--open' : ''}`} />
      <aside className={`places-drawer ${open ? 'places-drawer--open' : ''}`} ref={drawerRef}>
        <div className="places-header">
          <div className="places-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            My Places
          </div>
          <button className="places-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="places-search-wrapper">
          <div className="places-search-box">
            <svg className="places-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="places-search-input" type="text" placeholder="Search any city in the world..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="places-clear-btn" onClick={() => { setSearch(''); setSuggestions([]); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>}
          </div>

          {searching && <div className="places-searching"><div className="places-spinner" />Searching worldwide...</div>}

          {suggestions.length > 0 && (
            <div className="places-suggestions">
              {suggestions.map((city, i) => (
                <div key={i} className="places-suggestion-item">
                  <div className="places-suggestion-info">
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{flag(city.country)}</span>
                    <div>
                      <div className="places-suggestion-name">{city.name}</div>
                      <div className="places-suggestion-country">{city.state ? `${city.state}, ` : ''}{city.country}</div>
                    </div>
                  </div>
                  <button className={`places-add-btn ${isSaved(city) ? 'places-add-btn--saved' : ''}`}
                    onClick={() => !isSaved(city) && handleAddPlace(city)}>
                    {isSaved(city)
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Saved</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add</>
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="places-list-section">
          {favorites.length > 0 && (
            <>
              <div className="places-list-title">
                Saved Places <span className="places-count">{favorites.length}</span>
              </div>
              <div className="places-list">
                {favorites.map((city, i) => (
                  <div key={i} className="places-item" onClick={() => handleGoToPlace(city)}>
                    <div className="places-item-left">
                      <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{flag(city.country)}</span>
                      <div>
                        <div className="places-item-name">{city.name}</div>
                        {city.country && <div className="places-item-country">{city.country}</div>}
                      </div>
                    </div>
                    <button className="places-remove-btn" onClick={e => { e.stopPropagation(); removeFavorite(city.lat, city.lon); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ height: '1rem' }} />
            </>
          )}

          <div className="places-list-title" style={{ marginTop: favorites.length ? '0' : '0' }}>
            🌍 Popular Cities
          </div>
          <div className="places-list">
            {POPULAR_CITIES.filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i).map((city, i) => (
              <div key={i} className="places-item" onClick={() => handleGoToPlace(city)}>
                <div className="places-item-left">
                  <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{flag(city.country)}</span>
                  <div>
                    <div className="places-item-name">{city.name}</div>
                    <div className="places-item-country">{city.state ? `${city.state}, ` : ''}{city.country}</div>
                  </div>
                </div>
                {isSaved(city)
                  ? <span className="places-popular-saved">✓</span>
                  : <button className="places-add-btn" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                      onClick={e => { e.stopPropagation(); handleAddPlace(city); }}>
                      + Save
                    </button>
                }
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

/* ─── TopNav ────────────────────────────────────────────────────── */
const TopNav = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const { fetchWeatherData } = useWeatherContext();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try { setSuggestions(await weatherApi.getCoordinates(query.trim())); }
        catch { setSuggestions([]); }
        finally { setIsLoading(false); }
      } else { setSuggestions([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (city) => {
    const newRecents = [city, ...recentSearches.filter(c => c.name !== city.name || c.country !== city.country)].slice(0, 6);
    setRecentSearches(newRecents);
    localStorage.setItem('recentSearches', JSON.stringify(newRecents));
  };

  const handleSelectCity = (city) => {
    fetchWeatherData(city.lat, city.lon, city.name);
    saveRecentSearch(city);
    setQuery(''); setSuggestions([]); setIsFocused(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length > 0) { handleSelectCity(suggestions[0]); return; }
    try {
      setIsLoading(true);
      const results = await weatherApi.getCoordinates(query.trim());
      if (results?.length > 0) handleSelectCity(results[0]);
    } finally { setIsLoading(false); }
  };

  // Filter popular cities when typing — instant local matching
  const popularMatches = query.length > 0 && query.length <= 2
    ? POPULAR_CITIES.filter(c => c.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
    : [];

  const showDropdown = isFocused && (query.length > 0 || recentSearches.length > 0);

  return (
    <>
      <nav className="atmos-topnav">
        <div className="topnav-search-wrapper" ref={wrapperRef}>
          <form onSubmit={handleSubmit}>
            <span className="topnav-search-icon">
              {isLoading
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
            </span>
            <input
              type="text"
              className="topnav-search-input"
              placeholder="Search any city, town or country..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
            {query && (
              <button type="button" style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center' }}
                onClick={() => { setQuery(''); setSuggestions([]); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </form>

          {showDropdown && (
            <div className="search-dropdown">
              {/* Instant matches from popular cities (1-2 chars typed) */}
              {popularMatches.length > 0 && (
                <>
                  <div className="search-dropdown-section-label">Quick Match</div>
                  {popularMatches.map((city, i) => (
                    <div key={`pop-${i}`} className="search-dropdown-item" onClick={() => handleSelectCity(city)}>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{flag(city.country)}</span>
                      <div style={{ flex: 1 }}>
                        <div className="search-dropdown-item-name">{city.name}</div>
                        <div className="search-dropdown-item-country">{city.state ? `${city.state}, ` : ''}{city.country}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* API search results (3+ chars) */}
              {query.length > 2 && suggestions.length > 0 && (
                <>
                  <div className="search-dropdown-section-label">Search Results</div>
                  {suggestions.map((city, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => handleSelectCity(city)}>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{flag(city.country)}</span>
                      <div style={{ flex: 1 }}>
                        <div className="search-dropdown-item-name">{city.name}</div>
                        <div className="search-dropdown-item-country">{city.state ? `${city.state}, ` : ''}{city.country}</div>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        {city.lat?.toFixed(1)}°, {city.lon?.toFixed(1)}°
                      </span>
                    </div>
                  ))}
                </>
              )}

              {query.length > 2 && suggestions.length === 0 && !isLoading && (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                  No cities found for "{query}"
                </div>
              )}

              {/* Recent searches */}
              {query.length === 0 && recentSearches.length > 0 && (
                <>
                  <div className="search-dropdown-section-label">Recent</div>
                  {recentSearches.map((city, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => handleSelectCity(city)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <div style={{ flex: 1 }}>
                        <div className="search-dropdown-item-name">{city.name}</div>
                        <div className="search-dropdown-item-country">{city.country}</div>
                      </div>
                      <span style={{ fontSize: '1rem', lineHeight: 1 }}>{flag(city.country)}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Popular cities when nothing is typed */}
              {query.length === 0 && (
                <>
                  <div className="search-dropdown-section-label">🌍 Popular Cities</div>
                  {POPULAR_CITIES.slice(0, 12).map((city, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => handleSelectCity(city)}>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{flag(city.country)}</span>
                      <div style={{ flex: 1 }}>
                        <div className="search-dropdown-item-name">{city.name}</div>
                        <div className="search-dropdown-item-country">{city.state ? `${city.state}, ` : ''}{city.country}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="topnav-actions">
          <button
            className={`topnav-link topnav-link--places ${placesOpen ? 'topnav-link--active' : ''}`}
            onClick={() => setPlacesOpen(o => !o)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            My Places
          </button>
          <div className="topnav-avatar">🌤</div>
        </div>
      </nav>

      <MyPlacesDrawer open={placesOpen} onClose={() => setPlacesOpen(false)} />
    </>
  );
};

export default TopNav;
