// src/pages/Playlists.jsx
import { useState } from 'react';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import PlaylistManager from '../components/home/PlaylistManager';
import PlaylistDetail from '../components/home/PlaylistDetail';
import { getCurrentUser } from '../utils/auth';
import '../styles/home.css'; // استفاده از استایل‌های مشترک چیدمان

export default function Playlists() {
  const [user] = useState(() => getCurrentUser());
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  return (
    <div className="home-layout">
      {/* سایدبار سمت راست */}
      <Sidebar user={user} />

      <main className="home-main" style={{ paddingBottom: '120px' }}>
        {/* هدر بالایی */}
        <Header user={user} />

        <div className="home-content">
          {/* مدیریت رندر: نمایش جزئیات یا لیست اصلی پلی‌لیست‌ها */}
          {selectedPlaylist ? (
            <PlaylistDetail 
              playlist={selectedPlaylist} 
              onBack={() => setSelectedPlaylist(null)}
            />
          ) : (
            <PlaylistManager 
              currentUser={user} 
              onSelectPlaylist={(playlist) => setSelectedPlaylist(playlist)} 
            />
          )}
        </div>
      </main>
    </div>
  );
}