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

  const cycleCategory = (category) => {
    setOutfit(prev => ({
      ...prev,
      [category]: (prev[category] + 1) % categories[category].length
    }));
  };

  return (
    <div className="px-2 py-8 h-full flex flex-col">
      {/* Hat Selection - 15% of available height */}
      <button
        onClick={() => cycleCategory('hat')}
        style={{ height: '10%' }}
        className="w-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity mb-2"
      >
        <img 
          src={categories.hat[outfit.hat]} 
          alt={`Hat ${outfit.hat + 1}`}
          style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
          className="object-contain rounded-lg"
        />
      </button>

      {/* Shirt Selection - 35% of available height */}
      <button
        onClick={() => cycleCategory('shirt')}
        style={{ height: '38%' }}
        className="w-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity mb-2"
      >
        <img 
          src={categories.shirt[outfit.shirt]} 
          alt={`Shirt ${outfit.shirt + 1}`}
          style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
          className="object-contain rounded-lg"
        />
      </button>

      {/* Bottom Selection - 30% of available height */}
      <button
        onClick={() => cycleCategory('bottom')}
        style={{ height: '40%' }}
        className="w-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity mb-2"
      >
        <img 
          src={categories.bottom[outfit.bottom]} 
          alt={`Bottom ${outfit.bottom + 1}`}
          style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
          className="object-contain rounded-lg"
        />
      </button>

      {/* Shoe Selection - 20% of available height */}
      <button
        onClick={() => cycleCategory('shoe')}
        style={{ height: '15%' }}
        className="w-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
      >
        <img 
          src={categories.shoe[outfit.shoe]} 
          alt={`Shoe ${outfit.shoe + 1}`}
          style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
          className="object-contain rounded-lg"
        />
      </button>
    </div>
  );
};

export default OutfitPickerPage;
