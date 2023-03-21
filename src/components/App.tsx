import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import Navbar from './Navbar';

export default function App() {
  return (
    <>
      <Navbar />
      <Router>
        <Routes>
          <Route path="/" element={<FeedbackPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </>
  );
}
