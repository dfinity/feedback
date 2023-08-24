import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useIdentity from '../hooks/useIdentity';
import { FileDropZone } from './FileDropZone';
import Navbar from './Navbar';
import BrowsePage from './pages/BrowsePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import QueuePage from './pages/QueuePage';
import SubmitPage from './pages/SubmitPage';
import TopicPage from './pages/TopicPage';

import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'twin.macro';
import '../styles/index.scss';

export default function App() {
  const user = useIdentity();

  const app = (
    <Router>
      <ToastContainer position="bottom-right" />
      <div tw="w-screen min-h-screen overflow-x-hidden">
        <Navbar />
        <div tw="max-w-[800px] h-full mx-auto p-4 mt-1">
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/topic/:id" element={<TopicPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );

  return user?.detail.isModerator ? <FileDropZone>{app}</FileDropZone> : app;
}
