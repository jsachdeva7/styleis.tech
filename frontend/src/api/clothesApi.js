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

/**
 * Create outfit of the day (OOTD) with selected clothing IDs
 */
export const createOOTD = async (clothingIds) => {
  const response = await fetch(`${API_BASE_URL}/clothes/ootd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clothing_ids: clothingIds })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create OOTD');
  }

  return data;
};

/**
 * Get clothes in "jail" (suggested for donation)
 */
export const getJailClothes = async () => {
  const response = await fetch(`${API_BASE_URL}/clothes/jail`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch jail clothes');
  }
  
  const data = await response.json();
  return data.jail_clothes || [];
};

/**
 * Take a clothing item out of jail (keep it)
 */
export const takeOutOfJail = async (clothesId) => {
  const response = await fetch(`${API_BASE_URL}/clothes/jail/takeout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clothes_id: clothesId })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to take out of jail');
  }

  return data;
};

/**
 * Mark a clothing item for donation (add to donation basket)
 */
export const markForDonation = async (clothesId) => {
  const response = await fetch(`${API_BASE_URL}/clothes/jail/donate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clothes_id: clothesId })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to mark for donation');
  }

  return data;
};

/**
 * Get donation basket (items marked for donation)
 */
export const getDonationBasket = async () => {
  const response = await fetch(`${API_BASE_URL}/clothes/donations`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch donation basket');
  }
  
  const data = await response.json();
  return data.donation_basket || [];
};

