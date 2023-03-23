import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import FeedbackPage from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import { Suspense } from 'react';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <div tw="max-w-[800px] mx-auto px-3">
          <Suspense
            fallback={
              <div className="opacity-50 text-center text-2xl">Loading...</div>
            }
          >
            <Routes>
              <Route path="/" element={<FeedbackPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </>
  );
}
