import { useState } from 'react';
import DonationLocations from './DonationLocations';

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

  const [showLocations, setShowLocations] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleMoveToCloset = (itemId) => {
    setDonatedItems(donatedItems.filter(item => item.id !== itemId));
  };

  const handleConfirmDonation = (itemId) => {
    setDonatedItems(donatedItems.filter(item => item.id !== itemId));
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  if (showLocations) {
    return <DonationLocations onBackToSuggestions={onBackToSuggestions} onShowBasket={() => setShowLocations(false)} />;
  }

  return (
    <div className="p-4 h-full flex flex-col relative">
      {/* Popup */}
      {showPopup && (
        <div className="fixed bottom-36 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/60 backdrop-blur-md rounded-lg px-6 py-3 shadow-lg min-w-[280px]">
            <p className="text-base font-medium text-gray-800 text-center">
              ⭐ You're a star. You just saved ~6 lbs of CO2 emissions.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={onBackToSuggestions}
          className="px-4 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
        👉 Suggestions
        </button>
        <button
          onClick={() => setShowLocations(true)}
          className="px-4 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium flex items-center gap-2"
        >
          <span>📍</span>
          <span>Plan a Donation</span>
        </button>
      </div>
 
      <h2 className="text-2xl text-center font-semibold mb-4 text-[rgb(0,120,86)]">🧺 My Donation Basket</h2>

      <div className="flex-1 overflow-y-auto">
        {donatedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-600 text-center mb-6">Your donation basket is empty</p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {donatedItems.map((item) => (
              <div key={item.id} className="bg-white/40 backdrop-blur-md rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-4 mb-3">
                  {/* Clothing Preview */}
                  <div className="w-16 h-16 p-2 bg-white/30 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.displayName}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      Used {item.usage} times in the past six months
                    </p>
                  </div>

                  {/* Move to Closet Button */}
                  <button
                    onClick={() => handleMoveToCloset(item.id)}
                    className="bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg px-3 py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 flex-shrink-0 hover:bg-white/60 shadow-sm hover:shadow-md"
                    title="Move back to closet"
                  >
                    <span className="text-lg leading-none mb-1.5">🚪</span>
                    <span className="text-[10px] text-gray-600 font-semibold leading-none">Keep</span>
                  </button>
                </div>

                {/* Confirm Donation Button */}
                <button
                  onClick={() => handleConfirmDonation(item.id)}
                  className="w-full py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm"
                >
                  Confirm Donation
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
