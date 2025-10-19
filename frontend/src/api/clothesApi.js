const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

/**
 * Fetch all clothes from the backend
 */
export const fetchClothes = async () => {
  const response = await fetch(`${API_BASE_URL}/clothes`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch clothes');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to load clothes');
  }
  
  // Group clothes by sub_category
  const grouped = {
    headwear: [],
    shirts: [],
    layers: [],
    shorts: [],
    longPants: [],
    winterwear: [],
    shoes: [],
  };

  data.data.forEach((item) => {
    const subCategory = item.sub_category;
    if (grouped[subCategory]) {
      grouped[subCategory].push({
        id: item.id,
        image: item.link,  // S3 URL from backend
        name: item.item_name,
        ...item  // Include all other fields
      });
    }
  });

  return grouped;
};

/**
 * Add a new clothing item
 */
export const addClothingItem = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/clothes`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to add item');
  }

  return data;
};

