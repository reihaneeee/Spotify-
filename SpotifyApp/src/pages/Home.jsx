// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import Showcase from '../components/home/Showcase';
import EarlyAccess from '../components/home/EarlyAccess';
import { getCurrentUser } from '../utils/auth';
import { LifeBuoy, ArrowLeft, Disc } from 'lucide-react';
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

// کامپوننت‌های فاز اول
import NotificationsPanel from '../components/home/NotificationsPanel';
import PlaylistManager from '../components/home/PlaylistManager';
import MusicArchive from '../components/home/MusicArchive';
import PlaylistDetail from '../components/home/PlaylistDetail';

function Home() {
  const { notification, clearNotification } = useAuth();
  const { playSong } = usePlayback(); // فراخوانی متد پخش از کانتکست شما
  const location = useLocation(); 

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null); 

  // مدیریت نمایش اعلان‌های سراسری سیستم (پارت ۱۰ و ۱۱)
  useEffect(() => {
    if (notification) {
      alert(notification);
      clearNotification();
    }
  }, [notification, clearNotification]);

  // ریست کردن وضعیت انتخاب‌ها با تغییر روت
  useEffect(() => {
    setSelectedPlaylist(null);
    setSelectedAlbum(null); 
  }, [location.pathname]);

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
  const topSongs = [...songs, ...userSongs].sort((a, b) => b.plays - a.plays);
  const latestPlaylists = [...playlists].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  const isGold = user?.subscription === 'gold';

  // کامپوننت اختصاصی درون‌برنامه‌ای برای نمایش جزئیات آلبوم
  const AlbumDetailView = ({ album, onBack }) => {
    let albumTracks = songs.filter(s => s.albumId === album.id || s.albumTitle === album.title);
    
    // اگر آلبومی در دیتابیس ترک نداشت، به صورت داینامیک ترک‌های فرضی مچ با فایل PlaylistDetail ایجاد کن
    if (albumTracks.length === 0) {
      albumTracks = [
        { id: `track_${album.id}_1`, title: `${album.title} - Track 1`, artist: album.artist, cover: album.cover, albumId: album.id, itemType: 'song', plays: 0, listeners: [] },
        { id: `track_${album.id}_2`, title: `${album.title} - Track 2`, artist: album.artist, cover: album.cover, albumId: album.id, itemType: 'song', plays: 0, listeners: [] }
      ];
    }
    
    return (
      <div style={{ padding: '20px', color: '#fff', direction: 'ltr', fontFamily: 'sans-serif' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back to Archive
        </button>

        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <img src={album.cover} alt="" style={{ width: '180px', height: '180px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', objectFit: 'cover' }} />
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954', backgroundColor: '#181818', padding: '4px 10px', borderRadius: '12px' }}>ALBUM</span>
            <h2 style={{ fontSize: '36px', margin: '12px 0 6px 0', fontWeight: '900', letterSpacing: '-1px' }}>{album.title}</h2>
            <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              Artist: <span style={{ color: '#1db954' }}>{album.artist}</span> • Year: {album.year || '2024'}
            </p>
            <p style={{ margin: '6px 0 0 0', color: '#a7a7a7', fontSize: '13px' }}>
              Premium Status: {isGold ? '🟢 Gold Access Enabled' : '⚪ Standard Access'}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#121212', padding: '24px', borderRadius: '8px', minHeight: '200px' }}>
          <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '12px', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>Tracks List</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {albumTracks.map((track, index) => (
              <div key={track.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '6px', backgroundColor: '#181818', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#242424'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#181818'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#a7a7a7', width: '20px', fontSize: '14px' }}>{index + 1}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{track.title}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#b3b3b3' }}>{track.artist}</p>
                  </div>
                </div>
                <button 
                  onClick={() => playSong && playSong(track, albumTracks.filter(t => t.id !== track.id))} 
                  style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-layout">
      <Sidebar user={user} />

      <main className="home-main" style={{ paddingBottom: '120px' }}>
        <Header user={user} />

        {/* دکمه مینی‌مال، دارک و شیک پشتیبانی */}
        <div style={{ padding: '0 24px', marginBottom: '1rem' }}>
          <Link 
            to="/support" 
            className="support-btn" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              textDecoration: 'none',
              backgroundColor: '#242424',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #3e3e3e',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#242424'}
          >
            <LifeBuoy size={16} /> Contact Support
          </Link>
        </div>

        <div className="home-content" style={{ padding: '0 24px' }}>
          {/* مدیریت رندر بخش پلی‌لیست‌ها */}
          {location.pathname === '/playlists' && (
            selectedPlaylist ? (
              <PlaylistDetail playlist={selectedPlaylist} onBack={() => setSelectedPlaylist(null)} />
            ) : (
              <PlaylistManager currentUser={user} onSelectPlaylist={(p) => setSelectedPlaylist(p)} />
            )
          )}

          {location.pathname === '/singles' && <MusicArchive />}
          
          {/* مدیریت رندر بخش آلبوم‌ها */}
          {location.pathname === '/albums' && (
            selectedAlbum ? (
              <AlbumDetailView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
            ) : (
              <MusicArchive onSelectAlbum={(album) => setSelectedAlbum(album)} />
            )
          )}

          {(location.pathname === '/home' || location.pathname === '/') && (
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