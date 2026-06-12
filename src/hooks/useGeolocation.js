import { useState } from 'react';
import axios from 'axios';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_GEO = 'https://maps.googleapis.com/maps/api/geocode/json';

// Reverse geocode: coords → real city name
// Priority: Google Geocoding → BigDataCloud (both free tier)
const reverseGeocodeToName = async (lat, lon) => {
  // 1️⃣ Google Geocoding API — pinpoint accurate
  if (GOOGLE_KEY) {
    try {
      const res = await axios.get(GOOGLE_GEO, {
        params: {
          latlng: `${lat},${lon}`,
          key: GOOGLE_KEY,
          language: 'en',
          result_type: 'locality|administrative_area_level_2'
        }
      });
      if (res.data.status === 'OK' && res.data.results.length > 0) {
        const comps    = res.data.results[0].address_components;
        const locality = comps.find(c => c.types.includes('locality'));
        const area2    = comps.find(c => c.types.includes('administrative_area_level_2'));
        const area1    = comps.find(c => c.types.includes('administrative_area_level_1'));
        return locality?.long_name || area2?.long_name || area1?.long_name || null;
      }
    } catch { /* fall through */ }
  }
  // 2️⃣ BigDataCloud fallback (free, no key)
  try {
    const res = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: { latitude: lat, longitude: lon, localityLanguage: 'en' }
    });
    return res.data.city || res.data.locality || res.data.principalSubdivision || null;
  } catch {
    return null;
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Get the real city name from coordinates
        const cityName = await reverseGeocodeToName(lat, lon);

        setLocation({ lat, lon, name: cityName });
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: 'Location access denied. Please allow location in your browser settings.',
          2: 'Location unavailable. Try again.',
          3: 'Location request timed out. Try again.',
        };
        setError(messages[err.code] || err.message || 'Unable to retrieve your location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000  // cache for 1 min
      }
    );
  };

  return { location, error, loading, getLocation };
};
