import { useState } from 'react';

// Import assets
import blueCap from '../assets/hats/blue_cap.png';
import yellowCap from '../assets/hats/yellow_cap.png';
import jersey from '../assets/shirts/jersey.png';
import whiteShirt from '../assets/shirts/white shirt.png';
import cargo from '../assets/bottoms/cargo.png';
import jorts from '../assets/bottoms/jorts.png';
import dunkLows from '../assets/shoes/dunk lows.png';
import dunkLows2 from '../assets/shoes/dunk lows 2.png';

const DonationBasket = ({ onBackToSuggestions }) => {
  // Sample donated items - in a real app this would come from state/props
  const [donatedItems, setDonatedItems] = useState([
    { id: 1, image: jersey, displayName: 'Jersey', usage: 2 },
    { id: 2, image: dunkLows, displayName: 'Dunk Lows', usage: 1 },
    { id: 3, image: yellowCap, displayName: 'Yellow Cap', usage: 1 },
  ]);

  const handleMoveToCloset = (itemId) => {
    setDonatedItems(donatedItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Donation Basket</h2>
        <button
          onClick={onBackToSuggestions}
          className="px-4 py-2 bg-white border-2 border-[rgb(0,120,86)] text-[rgb(0,120,86)] rounded-lg hover:bg-[rgb(245,237,223)] transition-colors duration-200 font-medium text-sm"
        >
          Back to Suggestions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {donatedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-600 text-center mb-6">Your donation basket is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donatedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                {/* Clothing Preview */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.displayName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Item Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{item.displayName}</h3>
                  <p className="text-sm text-gray-600">
                    Used <span className="text-[rgb(0,120,86)] font-semibold">{item.usage} times in the past six months</span>
                  </p>
                </div>

                {/* Move to Closet Button */}
                <button
                  onClick={() => handleMoveToCloset(item.id)}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                  title="Move back to closet"
                >
                  <span className="text-lg">🚪</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationBasket;
