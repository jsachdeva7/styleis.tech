import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';

// Import assets
import blueCap from '../assets/hats/blue_cap.png';
import yellowCap from '../assets/hats/yellow_cap.png';
import jersey from '../assets/shirts/jersey.png';
import whiteShirt from '../assets/shirts/white shirt.png';
import cargo from '../assets/bottoms/cargo.png';
import jorts from '../assets/bottoms/jorts.png';
import dunkLows from '../assets/shoes/dunk lows.png';
import dunkLows2 from '../assets/shoes/dunk lows 2.png';

const OutfitPickerPage = () => {
  const [outfit, setOutfit] = useState({
    hat: 0,
    shirt: 0,
    bottom: 0,
    shoe: 0
  });

  const categories = {
    hat: [blueCap, yellowCap],
    shirt: [jersey, whiteShirt],
    bottom: [cargo, jorts],
    shoe: [dunkLows, dunkLows2]
  };

  const categoryNames = {
    hat: 'Hat',
    shirt: 'Shirt',
    bottom: 'Bottom',
    shoe: 'Shoes'
  };

  const cycleCategory = (category, direction = 1) => {
    setOutfit(prev => {
      const currentIndex = prev[category];
      const length = categories[category].length;
      const newIndex = direction === 1 
        ? (currentIndex + 1) % length
        : (currentIndex - 1 + length) % length;
      return {
        ...prev,
        [category]: newIndex
      };
    });
  };

  return (
    <div className="px-2 py-8 h-full flex flex-col relative">
      {/* Weather Display */}
      <div className="absolute top-2 right-2 bg-white/40 backdrop-blur-md rounded-lg px-2 py-0.5 shadow-sm">
        <div className="flex items-center gap-1">
          {/* Weather Icon */}
          <div className="text-sm">☀️</div>
          
          {/* Current Temperature */}
          <div className="text-xs font-medium text-gray-800">72°F</div>
        </div>
      </div>
      {/* Hat Selection - 15% of available height */}
      <div className="relative w-full" style={{ height: '10%' }}>
        <button
          onClick={() => cycleCategory('hat')}
          style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
          className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        >
          <img 
            src={categories.hat[outfit.hat]} 
            alt={`Hat ${outfit.hat + 1}`}
            style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
            className="object-contain rounded-lg"
          />
        </button>
        {/* Arrow Buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); cycleCategory('hat', -1); }}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCaretLeft} style={{color: "#007856"}} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); cycleCategory('hat', 1); }}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCaretRight} style={{color: "#007856"}} />
        </button>
      </div>

       {/* Shirt Selection - 35% of available height */}
       <div className="relative" style={{ height: '25%' }}>
         <button
           onClick={() => cycleCategory('shirt')}
           style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
           className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
         >
           <img 
             src={categories.shirt[outfit.shirt]} 
             alt={`Shirt ${outfit.shirt + 1}`}
             style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
             className="object-contain rounded-lg"
           />
         </button>
         
         {/* Arrow Buttons */}
         <button
           onClick={(e) => { e.stopPropagation(); cycleCategory('shirt', -1); }}
           className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
         >
           <FontAwesomeIcon icon={faCaretLeft} style={{color: "#007856"}} />
         </button>
         <button
           onClick={(e) => { e.stopPropagation(); cycleCategory('shirt', 1); }}
           className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
         >
           <FontAwesomeIcon icon={faCaretRight} style={{color: "#007856"}} />
         </button>

         {/* Add Layer Button */}
         <button
           onClick={() => console.log('Add layer')}
           className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 text-sm font-medium px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm"
         >
           Add layer
         </button>
       </div>

      {/* Bottom Selection - 30% of available height */}
      <div className="relative w-full" style={{ height: '35%' }}>
        <button
          onClick={() => cycleCategory('bottom')}
          style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
          className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        >
          <img 
            src={categories.bottom[outfit.bottom]} 
            alt={`Bottom ${outfit.bottom + 1}`}
            style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
            className="object-contain rounded-lg"
          />
        </button>
        {/* Arrow Buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); cycleCategory('bottom', -1); }}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCaretLeft} style={{color: "#007856"}} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); cycleCategory('bottom', 1); }}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCaretRight} style={{color: "#007856"}} />
        </button>
      </div>

      {/* Shoe Selection - 20% of available height */}
      <div className="relative w-full" style={{ height: '15%' }}>
        <button
          onClick={() => cycleCategory('shoe')}
          style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
          className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        >
          <img 
            src={categories.shoe[outfit.shoe]} 
            alt={`Shoe ${outfit.shoe + 1}`}
            style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
            className="object-contain rounded-lg"
          />
        </button>
        {/* Arrow Buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); cycleCategory('shoe', -1); }}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCaretLeft} style={{color: "#007856"}} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); cycleCategory('shoe', 1); }}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCaretRight} style={{color: "#007856"}} />
        </button>
      </div>
      
      <div className="flex flex-col items-center mt-4">
        <h2 className="text-2xl text-center font-semibold text-[rgb(0,120,86)] mb-2">Outfit of the Day</h2>
        <button
          onClick={() => console.log('Outfit locked in')}
          className="bg-white/40 hover:bg-white/60 backdrop-blur-md text-[rgb(0,120,86)] hover:text-gray-900 text-sm font-medium px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          Lock in
        </button>
      </div>
    </div>
  );
};

export default OutfitPickerPage;
