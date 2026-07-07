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
import TermsPrivacy from './pages/TermsPrivacy';
import AdminDashboard from './pages/AdminDashboard';
import Playlists from './pages/Playlists';

// کامپوننت پخش‌کننده موسیقی ثابت و پرووایدر آن
import MusicPlayerFixed from './components/home/MusicPlayerFixed';
import { PlaybackProvider } from './context/PlaybackContext'; // اضافه شد
import { triggerSubscriptionExpiryNotification } from './utils/notificationEngine';

// Auth utilities
import { initializeDefaultUsers } from './utils/auth'; 

function App() {
  const { user, loading } = useAuth(); // Access user from Context

  // Apply language settings globally to the HTML tag
  useEffect(() => {
    // Read language setting from localStorage
    const settings = JSON.parse(localStorage.getItem('spotifySettings') || '{}');
    const lang = settings.language || 'en';

    // Apply to HTML tag for CSS and translation tools
    document.documentElement.lang = lang;
    // Set RTL direction if language is Persian
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    // فایل src/App.jsx - داخل useEffect

    if (user) {
      console.log("=== دیباگ اشتراک ===");
      console.log("کاربر جاری یافت شد:", user);
      
      // ۱. اصلاح فیلد نقش به userType
      const userRole = user?.userType; 
      const userSub = user?.subscription;
      
      console.log("نقش اصلاح‌شده:", userRole, "| نوع اشتراک:", userSub);

      // ۲. اعمال شرط بر اساس فیلدهای واقعی پروژه شما
      if (userRole === 'listener' && userSub !== 'gold') {
        console.log("✅ شرط درست بود: کاربر شنونده است و اشتراک طلایی ندارد.");
        
        const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
        const hasAlert = stored.some(n => n.targetEmail === user.email && n.text.includes('اشتراک'));
        
        if (!hasAlert) {
          console.log("🚀 شلیک نوتیفیکیشن اتمام اشتراک به:", user.email);
          triggerSubscriptionExpiryNotification(user.email);
        } else {
          console.log("⏸️ اعلان از قبل وجود داشت.");
        }
      } else {
        console.log("❌ وارد شرط نشدیم چون یا ادمین/آرتیست است یا اشتراک کاربر فعلاً gold است.");
      }
      console.log("====================");
    }

    

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
    <PlaybackProvider> {/* حل مشکل: پرووایدر را اینجا می‌گذاریم تا پلیر زیرمجموعه آن شود */}
      <Routes>
        {/* Public Routes (Auth) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Note for Phase 2: Currently public for UI demonstration */}
        <Route path="/home" element={<Home />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/singles" element={<Home />} />
        <Route path="/albums" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/terms" element={<TermsPrivacy />} />
        <Route path="/privacy" element={<TermsPrivacy />} />
        <Route path="/artist-terms" element={<TermsPrivacy />} />

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
      </Routes>

      {/* پلیر ثابت سراسری در پایین تمام صفحات */}
      <MusicPlayerFixed currentUser={user} />
    </PlaybackProvider>
  );
}

export default App;