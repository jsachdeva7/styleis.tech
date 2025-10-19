import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { fetchWeather } from '../api/weatherApi';
import { fetchClothes } from '../api/clothesApi';
import LoadingSpinner from '../components/LoadingSpinner';

const OutfitPickerPage = () => {
  // Fetch weather data with caching (shared with other components)
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather'],
    queryFn: () => fetchWeather(),
    staleTime: 10 * 60 * 1000, // Weather data fresh for 10 minutes
    retry: 1,
  });

  // Fetch clothes data with caching (shared with Closet component)
  const { data: allClothes, isLoading: clothesLoading } = useQuery({
    queryKey: ['clothes'],
    queryFn: fetchClothes,
    staleTime: 5 * 60 * 1000, // Clothes data fresh for 5 minutes
  });

  const [outfit, setOutfit] = useState({
    hat: 0,
    shirt: 0,
    bottom: 0,
    shoe: 0
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLockingIn, setIsLockingIn] = useState(false);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  // Filter clothes by temperature range
  const categories = useMemo(() => {
    if (!allClothes || !weather) {
      return { hat: [], shirt: [], bottom: [], shoe: [] };
    }

    const currentTemp = 74;

    // Filter function to check if item is appropriate for current temperature
    const isAppropriateForTemp = (item) => {
      return currentTemp >= item.min_temp && currentTemp <= item.max_temp;
    };

    return {
      hat: allClothes.headwear?.filter(isAppropriateForTemp) || [],
      shirt: [...(allClothes.shirts || []), ...(allClothes.layers || []), ...(allClothes.winterwear || [])].filter(isAppropriateForTemp),
      bottom: [...(allClothes.shorts || []), ...(allClothes.longPants || [])].filter(isAppropriateForTemp),
      shoe: allClothes.shoes?.filter(isAppropriateForTemp) || []
    };
  }, [allClothes, weather]);

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
      if (length === 0) return prev; // No items to cycle through
      
      const newIndex = direction === 1 
        ? (currentIndex + 1) % length
        : (currentIndex - 1 + length) % length;
      return {
        ...prev,
        [category]: newIndex
      };
    });
  };

  const handleLockIn = async () => {
    // Collect the IDs of selected clothing items
    const clothingIds = [];
    
    if (categories.hat.length > 0 && categories.hat[outfit.hat]) {
      clothingIds.push(categories.hat[outfit.hat].id);
    }
    if (categories.shirt.length > 0 && categories.shirt[outfit.shirt]) {
      clothingIds.push(categories.shirt[outfit.shirt].id);
    }
    if (categories.bottom.length > 0 && categories.bottom[outfit.bottom]) {
      clothingIds.push(categories.bottom[outfit.bottom].id);
    }
    if (categories.shoe.length > 0 && categories.shoe[outfit.shoe]) {
      clothingIds.push(categories.shoe[outfit.shoe].id);
    }

    if (clothingIds.length === 0) {
      showToast('Please select at least one clothing item for your outfit', 'error');
      return;
    }

    try {
      setIsLockingIn(true);
      
      // Mock API call with a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock success response
      console.log('OOTD locked in with clothing IDs:', clothingIds);
      
      showToast('Outfit locked in! ✨', 'success');
    } catch (error) {
      console.error('Error creating OOTD:', error);
      showToast(`Failed to lock in outfit: ${error.message}`, 'error');
    } finally {
      setIsLockingIn(false);
    }
  };

  // Show loading spinner while fetching data
  if (weatherLoading || clothesLoading) {
    return (
      <div className="h-full flex flex-col">
        <LoadingSpinner message="Loading outfit picker..." />
      </div>
    );
  }

  return (
    <div className="px-2 py-8 h-full flex flex-col relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg backdrop-blur-md flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-[rgb(0,120,86)]/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Weather Display */}
      <div className="absolute top-2 right-2 bg-white/40 backdrop-blur-md rounded-lg px-2 py-0.5 shadow-sm">
        {weatherLoading ? (
          <div className="flex items-center gap-1 px-1">
            <div className="text-xs text-gray-600">Loading...</div>
          </div>
        ) : weather ? (
          <div className="flex items-center gap-1">
            {/* Weather Icon */}
            <div className="text-sm">{weather.weather_emoji}</div>
            
            {/* Current Temperature */}
            <div className="text-xs font-medium text-gray-800">{weather.temperature}°F</div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="text-sm">🌤️</div>
            <div className="text-xs font-medium text-gray-800">--°F</div>
          </div>
        )}
      </div>
      {/* Hat Selection - 15% of available height */}
      <div className="relative w-full" style={{ height: '15%' }}>
        {categories.hat.length > 0 ? (
          <button
            onClick={() => cycleCategory('hat')}
            style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
            className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img 
              src={categories.hat[outfit.hat]?.image} 
              alt={categories.hat[outfit.hat]?.name || 'Hat'}
              style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
              className="object-contain rounded-lg"
            />
          </button>
        ) : (
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
            <p className="text-xs text-gray-500">No hats for this weather</p>
          </div>
        )}
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
       <div className="relative" style={{ height: '27%' }}>
         {categories.shirt.length > 0 ? (
           <button
             onClick={() => cycleCategory('shirt')}
             style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
             className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
           >
             <img 
               src={categories.shirt[outfit.shirt]?.image} 
               alt={categories.shirt[outfit.shirt]?.name || 'Shirt'}
               style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
               className="object-contain rounded-lg"
             />
           </button>
         ) : (
           <div className="w-full h-full rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
             <p className="text-xs text-gray-500">No shirts for this weather</p>
           </div>
         )}
         
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

         {/* Add Layer Button - Only show when temperature is 65°F or below */}
         {weather && weather.temperature <= 65 && (
           <button
             onClick={() => console.log('Add layer')}
             className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 text-sm font-medium px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm"
           >
             Add layer
           </button>
         )}
       </div>

      {/* Bottom Selection - 30% of available height */}
      <div className="relative w-full" style={{ height: '27%' }}>
        {categories.bottom.length > 0 ? (
          <button
            onClick={() => cycleCategory('bottom')}
            style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
            className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img 
              src={categories.bottom[outfit.bottom]?.image} 
              alt={categories.bottom[outfit.bottom]?.name || 'Bottom'}
              style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
              className="object-contain rounded-lg"
            />
          </button>
        ) : (
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
            <p className="text-xs text-gray-500">No bottoms for this weather</p>
          </div>
        )}
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
      <div className="relative w-full" style={{ height: '12%' }}>
        {categories.shoe.length > 0 ? (
          <button
            onClick={() => cycleCategory('shoe')}
            style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' }}
            className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img 
              src={categories.shoe[outfit.shoe]?.image} 
              alt={categories.shoe[outfit.shoe]?.name || 'Shoe'}
              style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }}
              className="object-contain rounded-lg"
            />
          </button>
        ) : (
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
            <p className="text-xs text-gray-500">No shoes for this weather</p>
          </div>
        )}
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
          onClick={handleLockIn}
          disabled={isLockingIn}
          className="bg-white/40 hover:bg-white/60 backdrop-blur-md text-[rgb(0,120,86)] hover:text-gray-900 text-sm font-medium px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLockingIn ? 'Locking in...' : 'Lock in'}
        </button>
      </div>
    </div>
  );
};

export default OutfitPickerPage;
