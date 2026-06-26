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
import { useAuth } from './context/AuthContext';

// Auth utilities
import { initializeDefaultUsers } from './utils/auth'; // Uncommented this!

function App() {
  const { user, loading} = useAuth(); // Access user from Context

  // Apply language settings globally to the HTML tag
  useEffect(() => {
    // Read language setting from localStorage
    const settings = JSON.parse(localStorage.getItem('spotifySettings') || '{}');
    const lang = settings.language || 'en';

    // Apply to HTML tag for CSS and translation tools
    document.documentElement.lang = lang;
    // Set RTL direction if language is Persian
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [user]);

  // Initialize default users for testing (only runs once on mount)
  useEffect(() => {
    initializeDefaultUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', color: '#fff' }}>
        Loading...
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes (Auth) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 
        Note for Phase 2: 
        Currently, these pages are public for UI demonstration.
        In Phase 2, we will wrap them in a <ProtectedRoute /> component 
        to enforce actual authentication redirection.
      */}
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/artist/:id" element={<ArtistProfile />} />
      <Route path="/settings" element={<Settings />} />

      {/* Root Route - Redirect based on Authentication State */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;