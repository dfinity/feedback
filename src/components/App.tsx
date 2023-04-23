import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import 'twin.macro';
import { FileDropZone } from './FileDropZone';
import Navbar from './Navbar';
import ProfilePage from './pages/ProfilePage';
import QueuePage from './pages/QueuePage';
import SubmitPage from './pages/SubmitPage';
import TopicPage from './pages/TopicPage';
import BrowsePage from './pages/BrowsePage';

export default function App() {
  return (
    <FileDropZone>
      <div tw="w-screen overflow-x-hidden">
        <Router>
          <Navbar />
          <div tw="max-w-[800px] min-h-[400px] mx-auto p-4 mt-1">
            <Routes>
              <Route path="/" element={<BrowsePage />} />
              <Route path="/topic/:id" element={<TopicPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
        </Router>
      </div>
    </FileDropZone>
  );
}
