import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJailClothes, takeOutOfJail, markForDonation } from '../api/clothesApi';
import LoadingSpinner from './LoadingSpinner';

const DonationSuggestions = ({ onShowBasket }) => {
  const queryClient = useQueryClient();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Fetch jail clothes
  const { data: jailClothes, isLoading } = useQuery({
    queryKey: ['jailClothes'],
    queryFn: getJailClothes,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  });

  // Mutation for keeping item
  const keepMutation = useMutation({
    mutationFn: takeOutOfJail,
    onSuccess: () => {
      queryClient.invalidateQueries(['jailClothes']);
      queryClient.invalidateQueries(['clothes']);
      showToast('Keeping in your closet! 🚪', 'success');
      // Move to next item after a delay
      setTimeout(() => {
        if (jailClothes && currentItemIndex < jailClothes.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          setCurrentItemIndex(0);
        }
      }, 500);
    },
    onError: (error) => {
      showToast('Error: ' + error.message, 'error');
    },
  });

  // Mutation for donating item
  const donateMutation = useMutation({
    mutationFn: markForDonation,
    onSuccess: () => {
      queryClient.invalidateQueries(['jailClothes']);
      queryClient.invalidateQueries(['donationBasket']);
      queryClient.invalidateQueries(['clothes']);
      showToast('Adding to donation basket! 💝', 'success');
      // Move to next item after a delay
      setTimeout(() => {
        if (jailClothes && currentItemIndex < jailClothes.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          setCurrentItemIndex(0);
        }
      }, 500);
    },
    onError: (error) => {
      showToast('Error: ' + error.message, 'error');
    },
  });

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

  const handleDonate = () => {
    if (!currentItem) return;
    donateMutation.mutate(currentItem.id);
  };

  const handleKeep = () => {
    if (!currentItem) return;
    keepMutation.mutate(currentItem.id);
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return <LoadingSpinner message="Loading suggestions..." />;
  }

  // Handle empty jail
  if (!jailClothes || jailClothes.length === 0) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center">
        <p className="text-gray-600 text-center mb-6">No donation suggestions right now! 🎉</p>
        <button
          onClick={onShowBasket}
          className="px-6 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
          See donation basket 🧺
        </button>
      </div>
    );
  }

  const currentItem = jailClothes[currentItemIndex];

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center relative">
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

      {/* Clothing Item Card */}
      <div className="w-80 h-80 bg-white/40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden mb-6 p-4">
        <img 
          src={currentItem.link} 
          alt={currentItem.item_name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Usage Frequency Text */}
      <div className="text-center px-4 mb-6">
        <p className="text-gray-700 text-base font-medium">
          You've used your <span className="font-semibold">{currentItem.item_name || 'item'}</span>{' '}
          <span className="text-[rgb(0,120,86)] font-semibold">{currentItem.frequency || 0} times in the past six months</span>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleKeep}
          disabled={keepMutation.isPending}
          className="px-6 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {keepMutation.isPending ? 'Keeping...' : 'Keep'}
        </button>
        <button
          onClick={handleDonate}
          disabled={donateMutation.isPending}
          className="px-6 py-2 bg-[rgb(0,120,86)] text-white rounded-lg hover:bg-[rgb(0,100,70)] shadow-sm hover:shadow-md transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {donateMutation.isPending ? 'Donating...' : 'Donate'}
        </button>
      </div>

      {/* Basket Button */}
      <button
        onClick={onShowBasket}
        className="px-6 py-2 bg-white/40 backdrop-blur-md text-[rgb(0,120,86)] rounded-lg hover:bg-white/60 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
      >
        See donation basket 🧺
      </button>
    </div>
  );
};

export default DonationSuggestions;
