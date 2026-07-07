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
import Playlists from './pages/Playlists';

// مسیرهای آپدیت شده در پارت ۱۰ و ۱۱
import ArtistDashboard from './pages/ArtistDashboard/ArtistDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'; // ساختار تب‌بندی شده جدید
import SupportPage from './pages/Support/SupportPage';

// کامپوننت پخش‌کننده موسیقی ثابت و پرووایدرهای Context
import MusicPlayerFixed from './components/home/MusicPlayerFixed';
import { PlaybackProvider } from './context/PlaybackContext'; 
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext'; 

// Utilities & Styles
import { triggerSubscriptionExpiryNotification } from './utils/notificationEngine';
import { initializeDefaultUsers } from './utils/auth'; 
import './styles/globals.css';

function App() {
  const { user, loading } = useAuth(); 

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('spotifySettings') || '{}');
    const lang = settings.language || 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    if (user) {
      console.log("=== دیباگ اشتراک ===");
      console.log("کاربر جاری یافت شد:", user);
      
      const userRole = user?.userType; 
      const userSub = user?.subscription;
      
      console.log("نقش اصلاح‌شده:", userRole, "| نوع اشتراک:", userSub);

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
    <DataProvider>
      <PlaybackProvider>
        <Routes>
          {/* Public Routes (Auth) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Main App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/singles" element={<Home />} />
          <Route path="/albums" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<TermsPrivacy />} />
          <Route path="/privacy" element={<TermsPrivacy />} />
          <Route path="/artist-terms" element={<TermsPrivacy />} />
          
          {/* صفحات جدید فاز ۱ پارت ۱۰ و ۱۱ */}
          <Route path="/artist-dashboard" element={<ArtistDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/support" element={<SupportPage />} />
          
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
    </DataProvider>
  );
}

export default App;