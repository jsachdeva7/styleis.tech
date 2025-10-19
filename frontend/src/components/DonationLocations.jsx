import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const DonationLocations = ({ onBackToSuggestions, onShowBasket }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user's location via browser geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          fetchLocations(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  const fetchLocations = async (lat, lng) => {
    try {
      const response = await fetch(`http://localhost:5000/api/donations/locations?lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (response.ok) {
        // Add placeholder images to the locations
        const locationsWithImages = data.map((location, index) => ({
          ...location,
          image: [
            'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop'
          ][index % 5]
        }));
        setLocations(locationsWithImages);
      } else {
        setError(data.error || 'Failed to fetch donation centers');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={onBackToSuggestions}
          className="px-4 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
          👉 Suggestions
        </button>
        <button
          onClick={onShowBasket}
          className="px-4 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium flex items-center gap-2"
        >
          <span>🧺</span>
          <span>Donation Basket</span>
        </button>
      </div>

      <h2 className="text-2xl text-center font-semibold mb-4 text-[rgb(0,120,86)]">📍 Plan a Donation</h2>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Finding donation centers near you..." />}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500">Please check your location settings.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && locations.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-center">No donation centers found nearby.</p>
        </div>
      )}

      {/* Locations List */}
      {!loading && !error && locations.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-4 pb-6">
            {locations.map((location, index) => (
              <div key={index} className="bg-white/40 backdrop-blur-md rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  {/* Location Image */}
                  <div className="w-20 h-20 bg-white/30 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={location.image} 
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Location Info */}
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                    <p className="text-sm text-[rgb(0,120,86)] font-semibold">
                      {location.distance.toFixed(1)} miles away
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationLocations;

