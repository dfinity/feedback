import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import FeedbackPage from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import 'twin.macro';

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <div tw="max-w-[800px] mx-auto">
          <Routes>
            <Route path="/" element={<FeedbackPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}
