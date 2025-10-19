import { useState } from 'react';

const DonationLocations = ({ onBackToSuggestions, onShowBasket }) => {
  // Mock data for donation centers
  const [locations] = useState([
    {
      name: 'Goodwill Donation Center',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
      address: '123 Main St, City, State 12345',
      distance: 0.8
    },
    {
      name: 'Salvation Army',
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop',
      address: '456 Oak Ave, City, State 12345',
      distance: 1.2
    },
    {
      name: 'Local Homeless Shelter',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
      address: '789 Elm St, City, State 12345',
      distance: 2.1
    },
  ].sort((a, b) => a.distance - b.distance));

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={onBackToSuggestions}
          className="px-4 py-2 bg-white border-2 border-[rgb(0,120,86)] text-[rgb(0,120,86)] rounded-lg hover:bg-[rgb(245,237,223)] transition-colors duration-200 font-medium"
        >
          👉 Suggestions
        </button>
        <button
          onClick={onShowBasket}
          className="px-4 py-2 bg-white border-2 border-[rgb(0,120,86)] text-[rgb(0,120,86)] rounded-lg hover:bg-[rgb(245,237,223)] transition-colors duration-200 font-medium flex items-center gap-2"
        >
          <span>🧺</span>
          <span>Donation Basket</span>
        </button>
      </div>

      <h2 className="text-2xl text-center font-semibold mb-4 text-[rgb(0,120,86)]">📍 Plan a Trip</h2>

      {/* Locations List */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                {/* Location Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Location Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{location.name}</h3>
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
    </div>
  );
};

export default DonationLocations;

