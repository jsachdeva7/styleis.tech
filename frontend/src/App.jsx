import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClosetPage from './pages/ClosetPage';
import OutfitPickerPage from './pages/OutfitPickerPage';
import DonationPage from './pages/DonationPage';
import TabBar from './components/TabBar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="h-full bg-[rgb(245,237,223)] flex flex-col relative">
          <div className="flex-1 overflow-y-auto pb-16">
            <Routes>
              <Route path="/" element={<OutfitPickerPage />} />
              <Route path="/closet" element={<ClosetPage />} />
              <Route path="/donation" element={<DonationPage />} />
            </Routes>
          </div>
          <TabBar />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App
