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

const Closet = ({ onAddItem }) => {
  const [closetItems] = useState({
    headwear: [
      { id: 1, image: blueCap, name: 'Blue Cap' },
      { id: 2, image: yellowCap, name: 'Yellow Cap' },
    ],
    shirts: [
      { id: 3, image: jersey, name: 'Jersey' },
      { id: 4, image: whiteShirt, name: 'White Shirt' },
    ],
    layers: [
      // Empty for now
    ],
    shorts: [
      { id: 5, image: jorts, name: 'Jorts' },
    ],
    longPants: [
      { id: 6, image: cargo, name: 'Cargo Pants' },
    ],
    winterwear: [
      // Empty for now
    ],
    shoes: [
      { id: 7, image: dunkLows, name: 'Dunk Lows' },
      { id: 8, image: dunkLows2, name: 'Dunk Lows 2' },
    ],
  });

  const categories = [
    { key: 'headwear', label: 'Headwear', emoji: '🧢' },
    { key: 'shirts', label: 'Shirts', emoji: '👕' },
    { key: 'layers', label: 'Layers', emoji: '🧥' },
    { key: 'shorts', label: 'Shorts', emoji: '🩳' },
    { key: 'longPants', label: 'Long Pants', emoji: '👖' },
    { key: 'winterwear', label: 'Winterwear', emoji: '🧣' },
    { key: 'shoes', label: 'Shoes', emoji: '👟' },
  ];

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-2xl text-center font-semibold mb-4 text-[rgb(0,120,86)]">🚪 My Closet</h2>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 pb-6">
          {categories.map((category) => (
            <div key={category.key} className="bg-white/40 backdrop-blur-md rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Category Label */}
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>{category.emoji}</span>
                <span>{category.label}</span>
              </h3>

              {/* Items Shelf */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {closetItems[category.key].map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-16 h-16 bg-white/30 backdrop-blur-sm rounded-lg p-2 hover:bg-white/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
                {/* Add Item Button */}
                <button
                  onClick={() => onAddItem(category.key)}
                  className="flex-shrink-0 w-16 h-16 bg-white/30 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-[rgb(0,120,86)] hover:bg-white/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <span className="text-2xl text-[rgb(0,120,86)] leading-none">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Closet;

