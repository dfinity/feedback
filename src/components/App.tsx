import { Suspense } from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import ActivePage from './pages/ActivePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import RequestsPage from './pages/RequestsPage';

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <div tw="max-w-[800px] mx-auto p-4 mt-1">
          <Suspense
            fallback={
              <div className="opacity-50 text-center text-2xl">Loading...</div>
            }
          >
            <Routes>
              <Route path="/" element={<RequestsPage />} />
              <Route path="/active" element={<ActivePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </>
  );
}
