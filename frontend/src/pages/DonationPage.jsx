import { useState } from 'react';
import DonationSuggestions from '../components/DonationSuggestions';
import DonationBasket from '../components/DonationBasket';

const DonationPage = () => {
  const [showBasket, setShowBasket] = useState(false);

  const handleShowBasket = () => {
    setShowBasket(true);
  };

  const handleBackToSuggestions = () => {
    setShowBasket(false);
  };

  return (
    <div className="h-full">
      {showBasket ? (
        <DonationBasket onBackToSuggestions={handleBackToSuggestions} />
      ) : (
        <DonationSuggestions onShowBasket={handleShowBasket} />
      )}
    </div>
  );
};

export default DonationPage;
