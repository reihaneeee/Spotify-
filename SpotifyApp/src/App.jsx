// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ArtistProfile from './pages/ArtistProfile';
import Settings from './pages/Settings';
import TermsPrivacy from './pages/TermsPrivacy';
import ArtistDashboard from './pages/ArtistDashboard/ArtistDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import SupportPage from './pages/Support/SupportPage';

// Context & Utils
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext'; // 👈 ایمپورت جدید
import { initializeDefaultUsers } from './utils/auth'; 
import './styles/globals.css';

function App() {
  const { user, loading} = useAuth(); 

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('spotifySettings') || '{}');
    const lang = settings.language || 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [user]);

  useEffect(() => {
    initializeDefaultUsers();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', color: '#fff' }}>Loading...</div>;
  
  return (
    // 👈 اضافه شدن DataProvider
    <DataProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<TermsPrivacy />} />
        <Route path="/privacy" element={<TermsPrivacy />} />
        <Route path="/artist-terms" element={<TermsPrivacy />} />
        <Route path="/artist-dashboard" element={<ArtistDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/support" element={<SupportPage />} />
        
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </DataProvider>
  );
}

export default App;