import { useState } from 'react';

const AddItem = ({ onBack, category }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // TODO: Save item to closet
    console.log('Saving item:', { name, condition, price, category, image });
    onBack();
  };

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center relative">
      {/* Image Upload Card */}
      <div className="w-64 h-64 p-4 bg-white rounded-xl shadow-lg overflow-hidden mb-6 relative cursor-pointer group">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="w-full h-full flex items-center justify-center cursor-pointer">
          {image ? (
            <img 
              src={image} 
              alt="Uploaded item"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[rgb(0,120,86)] group-hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">Tap to add photo</p>
            </div>
          )}
        </label>
      </div>

      {/* Item Name Input */}
      <div className="w-80 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name..."
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[rgb(0,120,86)] text-base"
        />
      </div>

      {/* Condition Selection */}
      <div className="w-80 mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1.5">Condition</p>
        <div className="flex gap-2">
          {['New', 'Used', 'Worn'].map((cond) => (
            <button
              key={cond}
              onClick={() => setCondition(cond)}
              className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                condition === cond
                  ? 'bg-white text-gray-700 border-[rgb(0,120,86)]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[rgb(0,120,86)]'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Price Selection */}
      <div className="w-80 mb-8">
        <p className="text-xs font-medium text-gray-700 mb-1.5">Price Range</p>
        <div className="flex gap-2">
          {['$', '$$', '$$$'].map((priceRange) => (
            <button
              key={priceRange}
              onClick={() => setPrice(priceRange)}
              className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-base text-sm ${
                price === priceRange
                  ? 'bg-white text-gray-700 border-[rgb(0,120,86)]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[rgb(0,120,86)]'
              }`}
            >
              {priceRange}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pb-8">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white border-2 border-[rgb(0,120,86)] text-[rgb(0,120,86)] rounded-lg hover:bg-[rgb(245,237,223)] transition-colors duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[rgb(0,120,86)] text-white rounded-lg hover:bg-[rgb(0,100,70)] transition-colors duration-200 font-medium"
        >
          Save Item
        </button>
      </div>
    </div>
  );
};

export default AddItem;

