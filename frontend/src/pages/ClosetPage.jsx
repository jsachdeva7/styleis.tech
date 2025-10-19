import { useState } from 'react';
import Closet from '../components/Closet';
import AddItem from '../components/AddItem';

const ClosetPage = () => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleAddItem = (category) => {
    setSelectedCategory(category);
    setShowAddItem(true);
  };

  const handleBackToCloset = () => {
    setShowAddItem(false);
    setSelectedCategory(null);
  };

  return (
    <div className="h-full">
      {showAddItem ? (
        <AddItem onBack={handleBackToCloset} category={selectedCategory} />
      ) : (
        <Closet onAddItem={handleAddItem} />
      )}
    </div>
  );
};

export default ClosetPage;

