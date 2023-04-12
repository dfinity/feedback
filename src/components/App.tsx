import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import ProfilePage from './pages/ProfilePage';
import SubmitPage from './pages/SubmitPage';
import TopicsPage from './pages/TopicsPage';
import 'twin.macro';

export default function App() {
  return (
    <div tw="w-screen overflow-x-hidden">
      <Router>
        <Navbar />
        <div tw="max-w-[800px] mx-auto p-4 mt-1">
          <Routes>
            <Route path="/" element={<TopicsPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}
