const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch current weather data
 * If lat/lon not provided, backend will detect from IP
 */
export const fetchWeather = async (lat = null, lon = null) => {
  let url = `${API_BASE_URL}/weather`;
  
  if (lat && lon) {
    url += `?lat=${lat}&lon=${lon}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to load weather');
  }
  
  return data;
};

