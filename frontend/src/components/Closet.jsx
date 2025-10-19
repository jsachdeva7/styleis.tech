import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';
import { fetchClothes } from '../api/clothesApi';

const Closet = ({ onAddItem }) => {
  // Use TanStack Query for data fetching with caching
  const { data: closetItems, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['clothes'],
    queryFn: fetchClothes,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
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

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading your closet..." />}

      {/* Error State */}
      {isError && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-red-100 p-6 rounded-lg">
            <p className="text-red-600 font-medium mb-2">⚠️ {error?.message || 'Failed to load clothes'}</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-[rgb(0,120,86)] text-white rounded-lg hover:bg-[rgb(0,100,70)] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Clothes List */}
      {!loading && !isError && closetItems && (
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
      )}
    </div>
  );
};

export default Closet;

