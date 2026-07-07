// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import Showcase from '../components/home/Showcase';
import EarlyAccess from '../components/home/EarlyAccess';
import { LifeBuoy } from 'lucide-react';
import { initMockData, getSongs, getAlbums, getPlaylists, getEarlyAccess, getPublishedWorks, getArtists } from '../utils/mockData';
import '../styles/home.css';
import { Link } from 'react-router-dom';

const DEFAULT_COVER = `data:image/svg+xml;utf8,<svg width="300" height="300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: linear-gradient(135deg, %231a1a2e, %2316213e)"><circle cx="12" cy="12" r="10" stroke="%23ffffff" stroke-opacity="0.3" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="%23ffffff" fill-opacity="0.6"/></svg>`;

function Home() {
  initMockData();
  
  // 👇 استفاده مستقیم از کانتکست‌ها برای هماهنگی کامل
  const { user, updateUser: updateAuthUser } = useAuth();
  const { updateUser: updateDataUser } = useData(); 

  // سیستم نمایش پیام (فقط یک بار)
  useEffect(() => {
    if (user?.notifications && user.notifications.length > 0) {
      const unread = user.notifications.filter(n => !n.read);
      if (unread.length > 0) {
        alert(unread[0].message);
        
        const updatedNotifications = user.notifications.map(n => ({ ...n, read: true }));
        
        // ۱. آپدیت در دیتابیس کل کاربران
        updateDataUser(user.id || user.username, { notifications: updatedNotifications });
        // ۲. آپدیت در نشست فعال فعلی (باعث میشه دیگه نشون داده نشه)
        updateAuthUser({ notifications: updatedNotifications });
      }
    }
  }, [user?.notifications, updateDataUser, updateAuthUser]);

  const [songs] = useState(() => getSongs());
  const [albums] = useState(() => getAlbums());
  const [playlists] = useState(() => getPlaylists());
  const [earlyAccess] = useState(() => getEarlyAccess());
  const [publishedWorks] = useState(() => getPublishedWorks());
  const [allArtists] = useState(() => getArtists());

  const getArtistName = (artistId) => {
    const artist = allArtists.find(a => a.id === artistId);
    if (artist) return artist.name;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.id === artistId || u.username === artistId);
    if (foundUser) return foundUser.artistName || foundUser.displayName || foundUser.username;
    return 'Unknown Artist';
  };

  const userAlbums = publishedWorks.filter(w => w.type === 'album').map(w => ({
      id: w.id, title: w.title, artist: w.artistName || getArtistName(w.artistId), artistId: w.artistId,
      cover: w.cover && w.cover.trim() !== '' ? w.cover : DEFAULT_COVER,
      year: w.releaseDate ? new Date(w.releaseDate).getFullYear() : new Date().getFullYear(),
  }));

  const userSongs = publishedWorks.filter(w => w.type === 'single').map(w => ({
      id: w.id, title: w.title, artist: w.artistName || getArtistName(w.artistId), artistId: w.artistId,
      cover: w.cover && w.cover.trim() !== '' ? w.cover : DEFAULT_COVER,
      plays: w.plays || 0, releaseDate: w.releaseDate || new Date().toISOString()
  }));

  const latestAlbums = [...albums, ...userAlbums].sort((a, b) => b.year - a.year);
  const latestSingles = [...userSongs].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 10);
  const topSongs = [...songs, ...userSongs].filter(s => s.plays > 0).sort((a, b) => b.plays - a.plays);
  const latestPlaylists = [...playlists].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const isGold = user?.subscription === 'gold';

  return (
    <div className="home-layout">
      <Sidebar user={user} />
      <main className="home-main">
        <Header user={user} />
        <div style={{ padding: '0 2rem', marginBottom: '1rem' }}>
          <Link to="/support" className="support-btn">
            <LifeBuoy size={20} /> Contact Support
          </Link>
        </div>
        <div className="home-content">
          <Showcase title="Latest Playlists" items={latestPlaylists} type="playlist" />
          <Showcase title="Latest Albums" items={latestAlbums} type="album" />
          <Showcase title="New Releases (Singles)" items={latestSingles} type="song" />
          <Showcase title="Most Played Songs" items={topSongs} type="song" />
          <EarlyAccess items={earlyAccess} isGold={isGold} />
        </div>
      </main>
    </div>
  );
}

export default Home;