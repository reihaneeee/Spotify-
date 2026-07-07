// src/pages/Home.jsx

import { useState } from 'react';
import { useLocation } from 'react-router-dom'; // 🔴 اضافه شد برای تشخیص روت فعال
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import Showcase from '../components/home/Showcase';
import EarlyAccess from '../components/home/EarlyAccess';
import { getCurrentUser } from '../utils/auth';
import {
  initMockData,
  getSongs,
  getAlbums,
  getPlaylists,
  getEarlyAccess,
} from '../utils/mockData';
import '../styles/home.css';

// وارد کردن کامپوننت‌های جدید فاز اول
import NotificationsPanel from '../components/home/NotificationsPanel';
import PlaylistManager from '../components/home/PlaylistManager';
import MusicArchive from '../components/home/MusicArchive';

function Home() {
  initMockData();
  const location = useLocation(); // 🔴 خواندن آدرس فعلی مرورگر

  const [user] = useState(() => getCurrentUser());
  const [songs] = useState(() => getSongs());
  const [albums] = useState(() => getAlbums());
  const [playlists] = useState(() => getPlaylists());
  const [earlyAccess] = useState(() => getEarlyAccess());

  const latestPlaylists = [...playlists].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const latestAlbums = [...albums].sort((a, b) => b.year - a.year);
  const topSongs = [...songs].sort((a, b) => b.plays - a.plays);
  const isGold = user?.subscription === 'gold';

  return (
    <div className="home-layout">
      <Sidebar user={user} />

      <main className="home-main" style={{ paddingBottom: '120px' }}>
        <Header user={user} />

        <div className="home-content" style={{ padding: '0 24px' }}>
          {/* 🔴 شرط هوشمند رندر محتوا بر اساس روت فعال سایدبار */}
          
          {location.pathname === '/playlists' && (
            /* بخش ۷: فقط مدیریت لیست‌های پخش در روت اصلی پلی‌لیست */
            <PlaylistManager currentUser={user} />
          )}

          {location.pathname === '/singles' && (
            /* بخش ۸: نمایش آرشیو قطعات هنگام کلیک روی تک‌آهنگ‌ها */
            <MusicArchive />
          )}

          {location.pathname === '/albums' && (
            /* بخش ۸: نمایش آرشیو قطعات هنگام کلیک روی آلبوم‌ها */
            <MusicArchive />
          )}

          {(location.pathname === '/home' || location.pathname === '/') && (
            /* صفحه اصلی پیش‌فرض: نمایش اعلانات + ویترین موسیقی‌ها */
            <>
              <NotificationsPanel currentUser={user} />
              <Showcase title="Latest Playlists" items={latestPlaylists} type="playlist" />
              <Showcase title="Latest Albums" items={latestAlbums} type="album" />
              <Showcase title="Most Played Songs" items={topSongs} type="song" />
              <EarlyAccess items={earlyAccess} isGold={isGold} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;