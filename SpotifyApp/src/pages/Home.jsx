// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // 👈 اضافه شد
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import Showcase from '../components/home/Showcase';
import EarlyAccess from '../components/home/EarlyAccess';
import { getCurrentUser } from '../utils/auth';
import { LifeBuoy } from 'lucide-react';
import {
  initMockData,
  getSongs,
  getAlbums,
  getPlaylists,
  getEarlyAccess,
  getPublishedWorks,
  getArtists
} from '../utils/mockData';
import '../styles/home.css';
import { Link } from 'react-router-dom';

function Home() {
  const { notification, clearNotification } = useAuth();

  // 👇 نمایش اعلان
  useEffect(() => {
    if (notification) {
      alert(notification);
      clearNotification();
    }
  }, [notification, clearNotification]);

  initMockData();

  const [user] = useState(() => getCurrentUser());
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
    const user = users.find(u => u.id === artistId || u.username === artistId);
    if (user) return user.artistName || user.displayName || user.username;
    return 'Unknown Artist';
  };

  const userAlbums = publishedWorks
    .filter(w => w.type === 'album')
    .map(w => ({
      id: w.id,
      title: w.title,
      artist: w.artistName || getArtistName(w.artistId),
      artistId: w.artistId,
      cover: w.cover || 'https://via.placeholder.com/300/2a2a2a/fff?text=No+Cover',
      year: w.releaseDate ? new Date(w.releaseDate).getFullYear() : new Date().getFullYear(),
    }));

  const userSongs = publishedWorks
    .filter(w => w.type === 'single')
    .map(w => ({
      id: w.id,
      title: w.title,
      artist: w.artistName || getArtistName(w.artistId),
      artistId: w.artistId,
      cover: w.cover || 'https://via.placeholder.com/300/2a2a2a/fff?text=No+Cover',
      plays: w.plays || 0,
    }));

  const latestAlbums = [...albums, ...userAlbums].sort((a, b) => b.year - a.year);
  const topSongs = [...songs, ...userSongs]
    .filter(s => s.plays > 0)
    .sort((a, b) => b.plays - a.plays);
  const latestPlaylists = [...playlists].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
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
          <Showcase title="Most Played Songs" items={topSongs} type="song" />
          <EarlyAccess items={earlyAccess} isGold={isGold} />
        </div>
      </main>
    </div>
  );
}

export default Home;