import { Link, useLocation } from 'react-router-dom';

const TabBar = () => {
  const location = useLocation();

  const tabs = [
    { path: '/', label: 'Closet', icon: '🚪' },
    { path: '/outfit-picker', label: 'OOTD', icon: '👕' },
    { path: '/donation', label: 'Donate', icon: '💝' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'text-white bg-[rgb(0,120,86)]' 
                  : 'text-gray-600 hover:text-[rgb(0,120,86)]'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
