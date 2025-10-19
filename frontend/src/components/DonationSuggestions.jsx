import { useState } from 'react';

// Import assets for cycling
import blueCap from '../assets/hats/blue_cap.png';
import yellowCap from '../assets/hats/yellow_cap.png';
import jersey from '../assets/shirts/jersey.png';
import whiteShirt from '../assets/shirts/white shirt.png';
import cargo from '../assets/bottoms/cargo.png';
import jorts from '../assets/bottoms/jorts.png';
import dunkLows from '../assets/shoes/dunk lows.png';
import dunkLows2 from '../assets/shoes/dunk lows 2.png';

const DonationSuggestions = ({ onShowBasket }) => {
  const [currentItem, setCurrentItem] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Items to cycle through with their metadata
  const donationItems = [
    // Hats
    { image: blueCap, name: 'hat', displayName: 'Blue Cap', usage: 0 },
    { image: yellowCap, name: 'hat', displayName: 'Yellow Cap', usage: 1 },
    // Shirts
    { image: jersey, name: 'shirt', displayName: 'Jersey', usage: 2 },
    { image: whiteShirt, name: 'shirt', displayName: 'White Shirt', usage: 0 },
    // Bottoms
    { image: cargo, name: 'bottom', displayName: 'Cargo Pants', usage: 0 },
    { image: jorts, name: 'bottom', displayName: 'Jorts', usage: 1 },
    // Shoes
    { image: dunkLows, name: 'shoe', displayName: 'Dunk Lows', usage: 1 },
    { image: dunkLows2, name: 'shoe', displayName: 'Dunk Lows 2', usage: 2 },
  ];

  const handleDonate = () => {
    setPopupMessage('💝 Adding to donation basket!');
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setCurrentItem((prev) => (prev + 1) % donationItems.length);
    }, 500);
  };

  const handleKeep = () => {
    setPopupMessage('🚪 Keeping in your closet!');
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setCurrentItem((prev) => (prev + 1) % donationItems.length);
    }, 500);
  };

  const item = donationItems[currentItem];

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center relative">
      {/* Popup Above Card */}
      {showPopup && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-lg px-6 py-2 shadow-lg border border-gray-200 min-w-[200px]">
            <p className="text-base font-medium text-gray-800 whitespace-nowrap">{popupMessage}</p>
          </div>
        </div>
      )}

      {/* Clothing Item Card */}
      <div className="w-80 h-80 bg-white rounded-xl shadow-lg overflow-hidden mb-6 p-4">
        <img 
          src={item.image} 
          alt={item.displayName}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Usage Frequency Text */}
      <div className="text-center px-4 mb-6">
        <p className="text-gray-700 text-base font-medium">
          You've used your {item.displayName.toLowerCase()} <span className="text-[rgb(0,120,86)] font-semibold">{item.usage} times in the past six months</span>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleKeep}
          className="px-6 py-2 bg-white border-2 border-[rgb(0,120,86)] text-[rgb(0,120,86)] rounded-lg hover:bg-[rgb(245,237,223)] transition-colors duration-200 font-medium"
        >
          Keep
        </button>
        <button
          onClick={handleDonate}
          className="px-6 py-2 bg-[rgb(0,120,86)] text-white rounded-lg hover:bg-[rgb(0,100,70)] transition-colors duration-200 font-medium"
        >
          Donate
        </button>
      </div>

      {/* Basket Button */}
      <button
        onClick={onShowBasket}
        className="px-6 py-2 bg-white border-2 border-[rgb(0,120,86)] text-[rgb(0,120,86)] rounded-lg hover:bg-[rgb(245,237,223)] transition-colors duration-200 font-medium"
      >
        See donation basket 🧺
      </button>
    </div>
  );
};

export default DonationSuggestions;
