import { useState, useEffect } from 'react';

const HomePage = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
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
