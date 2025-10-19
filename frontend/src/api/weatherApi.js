const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

/**
 * Get user's location using browser geolocation API
 */
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to Austin, TX coordinates
        resolve({
          lat: 30.2672,
          lon: -97.7431
        });
      },
      {
        timeout: 5000,
        maximumAge: 300000, // Cache position for 5 minutes
        enableHighAccuracy: false
      }
    );
  });
};

/**
 * Fetch current weather data
 * Uses browser geolocation to get accurate user location
 */
export const fetchWeather = async () => {
  try {
    // Get user's actual location from browser
    const { lat, lon } = await getUserLocation();
    
    const url = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load weather');
    }
    
    return data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

