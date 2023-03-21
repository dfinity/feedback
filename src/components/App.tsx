import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import 'twin.macro';

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <div tw="max-w-[600px] mx-auto">
          <Routes>
            <Route path="/" element={<FeedbackPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}
