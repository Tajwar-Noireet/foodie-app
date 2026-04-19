import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import DesktopSidebar from './components/DesktopSidebar'; // 1. IMPORT SIDEBAR
import './App.css';

// --- TEMPORARY SCREEN PLACEHOLDERS ---
const FeedScreen = () => <div style={{padding: '40px'}}>Feed Screen (Screen 1)</div>;
const ExploreScreen = () => <div style={{padding: '40px'}}>Explore Screen Placeholder</div>;
const CreateScreen = () => <div style={{padding: '40px'}}>Create Recipe (Screen 3)</div>;
const ProfileScreen = () => <div style={{padding: '40px'}}>User Profile (Screen 4)</div>;
const SavedScreen = () => <div style={{padding: '40px'}}>Saved Recipes (Screen 5)</div>;

function App() {
  return (
    <div className="app-layout"> {/* We'll update this classname slightly in App.css */}
      
      {/* 2. ADD THE SIDEBAR HERE */}
      <DesktopSidebar /> 

      <div className="main-content">
        <Routes>
          <Route path="/" element={<FeedScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/create" element={<CreateScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/saved" element={<SavedScreen />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  );
}

export default App;