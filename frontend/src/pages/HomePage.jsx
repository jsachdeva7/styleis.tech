import { useState, useEffect } from 'react';

const HomePage = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hello`)
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div className="p-4">
    </div>
  );
};

export default HomePage;
