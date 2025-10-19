import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDonationBasket, takeOutOfJail } from '../api/clothesApi';
import DonationLocations from './DonationLocations';
import LoadingSpinner from './LoadingSpinner';

const DonationBasket = ({ onBackToSuggestions }) => {
  const queryClient = useQueryClient();
  const [showLocations, setShowLocations] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Fetch donation basket
  const { data: donatedItems, isLoading } = useQuery({
    queryKey: ['donationBasket'],
    queryFn: getDonationBasket,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  });

  // Mutation for moving back to closet
  const moveToClosetMutation = useMutation({
    mutationFn: takeOutOfJail,
    onSuccess: () => {
      queryClient.invalidateQueries(['donationBasket']);
      queryClient.invalidateQueries(['jailClothes']);
      queryClient.invalidateQueries(['clothes']);
      showToast('Moved back to closet! 🚪', 'success');
    },
    onError: (error) => {
      showToast('Error: ' + error.message, 'error');
    },
  });

  // Mock confirm donation (no backend endpoint for this yet)
  const handleConfirmDonation = (itemId) => {
    showToast('⭐ You\'re a star. You just saved ~6 lbs of CO2 emissions.', 'success');
    // In a real app, this would delete the item or mark it as actually donated
    setTimeout(() => {
      queryClient.invalidateQueries(['donationBasket']);
    }, 2000);
  };

  const handleMoveToCloset = (itemId) => {
    moveToClosetMutation.mutate(itemId);
  };

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

  if (showLocations) {
    return <DonationLocations onBackToSuggestions={onBackToSuggestions} onShowBasket={() => setShowLocations(false)} />;
  }

  // Show loading spinner while fetching data
  if (isLoading) {
    return <LoadingSpinner message="Loading donation basket..." />;
  }

  return (
    <div className="p-4 h-full flex flex-col relative">
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
        {!donatedItems || donatedItems.length === 0 ? (
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
                      src={item.link} 
                      alt={item.item_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.item_name || 'Unnamed Item'}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      Used {item.frequency || 0} times in the past six months
                    </p>
                  </div>

                  {/* Move to Closet Button */}
                  <button
                    onClick={() => handleMoveToCloset(item.id)}
                    disabled={moveToClosetMutation.isPending}
                    className="bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg px-3 py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 flex-shrink-0 hover:bg-white/60 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
