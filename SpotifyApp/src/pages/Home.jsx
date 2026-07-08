// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import { usePlayback } from '../context/PlaybackContext'; 
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import EarlyAccess from '../components/home/EarlyAccess';
import { getCurrentUser } from '../utils/auth';
import { LifeBuoy, ArrowLeft, Music, Play } from 'lucide-react';
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

import NotificationsPanel from '../components/home/NotificationsPanel';
import PlaylistManager from '../components/home/PlaylistManager';
import MusicArchive from '../components/home/MusicArchive';
import PlaylistDetail from '../components/home/PlaylistDetail';

function Home() {
  const { notification, clearNotification } = useAuth();
  const { playSong } = usePlayback(); 
  const location = useLocation(); 
  const navigate = useNavigate();

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null); 
  const [user, setUser] = useState(() => getCurrentUser());

  const [topSongsState, setTopSongsState] = useState([]);

  initMockData();

  const [songs] = useState(() => getSongs());
  const [albums] = useState(() => getAlbums());
  const [playlists] = useState(() => getPlaylists());
  const [earlyAccess] = useState(() => getEarlyAccess());
  const [publishedWorks] = useState(() => getPublishedWorks());
  const [allArtists] = useState(() => getArtists());

  // محاسبه کاملاً پویا و زنده محبوب‌ترین آهنگ‌ها برحسب فیلد لایو plays در لود صفحه خانه
  useEffect(() => {
    const activeUser = getCurrentUser();
    if (!activeUser) {
      navigate('/login');
      return;
    }
    setUser(activeUser);

    // واکشی مجدد آخرین دیتای لایو ذخیره شده در لوکال استوریج
    const liveSongs = JSON.parse(localStorage.getItem('songs') || '[]');
    let livePublishedWorks = [];
    try {
      // 🛠️ سینک زنده بخش Most Played هوم با کلید اصلی شما (artist_works)
      livePublishedWorks = JSON.parse(localStorage.getItem('artist_works') || '[]');
    } catch(e) {}

    const userSongsMapped = livePublishedWorks
      .filter(w => w.type === 'single' || w.type === 'track')
      .map(w => ({
        id: w.id,
        title: w.title,
        artist: w.artistName || 'artist6',
        artistId: w.artistId,
        cover: w.cover || null,
        plays: w.plays || 0,
        uniqueUsers: w.uniqueUsers || [],
        itemType: 'song',
        src: w.audioUrl || w.audioData || ''
      }));

    // استخراج ترک‌های داخل آلبوم‌ها برای شرکت در رقابت محبوب‌ترین‌ها
    let albumTracksMapped = [];
    livePublishedWorks.forEach(album => {
      if (album.type === 'album' && album.tracks) {
        album.tracks.forEach(t => {
          albumTracksMapped.push({
            id: t.id,
            title: t.title,
            artist: t.artist || album.artistName || 'Uploaded Artist',
            artistId: album.artistId,
            cover: t.cover || album.cover,
            plays: t.plays || 0,
            uniqueUsers: t.uniqueUsers || [],
            itemType: 'song',
            src: t.audioData || t.audioUrl || t.src || ''
          });
        });
      }
    });

    const combinedSongs = [
      ...liveSongs.map(s => ({ ...s, itemType: 'song', plays: s.plays || 0, uniqueUsers: s.uniqueUsers || [] })),
      ...userSongsMapped,
      ...albumTracksMapped
    ];

    // فیلتر آیدی‌های تکراری و مرتب‌سازی قاطع برحسب تعداد دفعات پخش (plays) نزولی
    const seenIds = new Set();
    const sortedTopSongs = combinedSongs
      .filter(s => {
        if (seenIds.has(s.id)) return false;
        seenIds.add(s.id);
        return true;
      })
      .sort((a, b) => b.plays - a.plays);

    setTopSongsState(sortedTopSongs);
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleGlobalAlbumSelect = (e) => {
      if (e.detail) {
        setSelectedAlbum(e.detail);
        navigate('/albums'); 
      }
    };
    window.addEventListener('globalSelectAlbum', handleGlobalAlbumSelect);
    return () => window.removeEventListener('globalSelectAlbum', handleGlobalAlbumSelect);
  }, [navigate]);

  useEffect(() => {
    if (notification) {
      alert(notification);
      clearNotification();
    }
  }, [notification, clearNotification]);

  useEffect(() => {
    if (location.pathname !== '/albums') {
      setSelectedAlbum(null); 
    }
    setSelectedPlaylist(null);
  }, [location.pathname]);

  const handleSelectArtist = (artistNameOrId) => {
    const storedArtists = JSON.parse(localStorage.getItem('artists') || '[]');
    const foundArtist = storedArtists.find(a => a.id === artistNameOrId || a.name === artistNameOrId);
    if (foundArtist) {
      localStorage.setItem('selected_artist_view', JSON.stringify(foundArtist));
    } else {
      localStorage.setItem('selected_artist_view', JSON.stringify({ id: artistNameOrId, name: artistNameOrId, bio: 'Verified Spotify Artist' }));
    }
    navigate('/profile'); 
  };

  const getArtistName = (artistId) => {
    const artist = allArtists.find(a => a.id === artistId);
    if (artist) return artist.name;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === artistId || u.username === artistId);
    if (user) return user.artistName || user.displayName || user.username;
    return 'Unknown Artist';
  };

  if (!user) return null;

  const userAlbums = publishedWorks
    .filter(w => w.type === 'album')
    .map(w => ({
      id: w.id,
      title: w.title,
      artist: w.artistName || getArtistName(w.artistId),
      artistId: w.artistId,
      cover: w.cover || null,
      year: w.releaseDate ? new Date(w.releaseDate).getFullYear() : new Date().getFullYear(),
      itemType: 'album'
    }));

  const latestAlbums = [...albums.map(a => ({ ...a, itemType: 'album' })), ...userAlbums].sort((a, b) => b.year - a.year);
  
  const getDynamicPlaylists = () => {
    const stored = JSON.parse(localStorage.getItem('playlists') || '[]');
    const activeEmail = user.email || '';
    const userPls = stored.filter(p => p.ownerEmail === activeEmail || p.createdBy === activeEmail || p.owner === (user.displayName || user.username));
    return userPls.length > 0 ? userPls.map(p => ({ ...p, itemType: 'playlist' })) : playlists.map(p => ({ ...p, itemType: 'playlist' }));
  };
  
  const latestPlaylists = getDynamicPlaylists();
  const isGold = user?.subscription === 'gold';

  const UnifiedShowcase = ({ title, items, type, onSelect }) => {
    const [hoveredId, setHoveredId] = useState(null);

    const handleItemClick = (item) => {
      if (type === 'song') {
        // کاملاً تمیز شد. فراخوانی playSong به تنهایی آمار را درست ثبت می‌کند.
        playSong(item, items.filter(s => s.id !== item.id));
      } else if (type === 'playlist') {
        setSelectedPlaylist(item);
        navigate('/playlists');
      } else {
        if (onSelect) onSelect(item);
      }
    };

    return (
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '18px', color: '#fff', letterSpacing: '-0.5px' }}>{title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
          {items.slice(0, 5).map((item, idx) => {
            const currentId = item.id || idx;
            const isHovered = hoveredId === currentId;
            return (
              <div
                key={currentId}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredId(currentId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: isHovered ? '#242424' : '#181818',
                  padding: '16px',
                  borderRadius: '8px',
                  position: 'relative',
                  transition: 'background-color 0.25s ease',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', marginBottom: '14px', backgroundColor: '#282828', borderRadius: '6px', overflow: 'hidden' }}>
                  {item.cover ? <img src={item.cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Music size={44} style={{ color: '#535353' }} /></div>}
                  
                  {type === 'song' && (
                    <div style={{ position: 'absolute', bottom: isHovered ? '12px' : '-50px', right: '12px', backgroundColor: '#1db954', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isHovered ? 'scale(1)' : 'scale(0.6)', opacity: isHovered ? 1 : 0, zIndex: 3 }}>
                      <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
                    </div>
                  )}
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>{item.title || item.name}</h4>
                <p 
                  onClick={(e) => {
                    if (type !== 'playlist') {
                      e.stopPropagation();
                      handleSelectArtist(item.artistId || item.artist);
                    }
                  }}
                  style={{ color: '#b3b3b3', fontSize: '13px', margin: 0, cursor: type !== 'playlist' ? 'pointer' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseOver={(e) => { if(type !== 'playlist') e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseOut={(e) => { if(type !== 'playlist') e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {type === 'playlist' ? `${item.songs?.length || 0} tracks` : (item.artist || 'Spotify Work')}
                </p>
                {type === 'song' && (
                  <div style={{ fontSize: '11px', color: '#6a6a6a', marginTop: '4px' }}>
                    {item.plays || 0} plays • {(item.uniqueUsers || []).length} listeners
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AlbumDetailView = ({ album, onBack }) => {
    const [activeTrackMenuId, setActiveTrackMenuId] = useState(null);
    const [myPlaylists, setMyPlaylists] = useState([]);

    useEffect(() => {
      const rawUser = localStorage.getItem('currentUser') || localStorage.getItem('spotify_current_user') || '{}';
      const currentActiveUser = JSON.parse(rawUser);
      const userEmail = currentActiveUser.email || '';
      
      const stored = JSON.parse(localStorage.getItem('playlists') || '[]');
      const userPlaylists = stored.filter(p => 
        p.ownerEmail === userEmail || 
        p.createdBy === userEmail || 
        p.owner === (currentActiveUser.displayName || currentActiveUser.username)
      );
      setMyPlaylists(userPlaylists);
    }, [activeTrackMenuId]);

    let albumTracks = album.tracks || [];
    if (albumTracks.length === 0) {
      albumTracks = songs.filter(s => s.albumId === album.id || s.albumTitle === album.title);
    }

    const handleAddToPlaylist = (playlistId, track) => {
      const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
      const updated = allPlaylists.map(p => {
        if (p.id === playlistId) {
          const currentSongs = p.songs || [];
          if (currentSongs.some(s => s.id === track.id)) {
            alert('This track is already in your playlist!');
            return p;
          }
          return { ...p, songs: [...currentSongs, { ...track, itemType: 'song' }] };
        }
        return p;
      });
      localStorage.setItem('playlists', JSON.stringify(updated));
      setActiveTrackMenuId(null);
      alert('Track added to playlist successfully!');
    };

    return (
      <div style={{ padding: '20px', color: '#fff', direction: 'ltr', fontFamily: 'sans-serif' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <img src={album.cover || 'https://picsum.photos/300'} alt="" style={{ width: '180px', height: '180px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', objectFit: 'cover' }} />
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954', backgroundColor: '#181818', padding: '4px 10px', borderRadius: '12px' }}>ALBUM</span>
            <h2 style={{ fontSize: '36px', margin: '12px 0 6px 0', fontWeight: '900', letterSpacing: '-1px' }}>{album.title}</h2>
            <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              Artist: <span style={{ color: '#1db954', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleSelectArtist(album.artistId || album.artist)}>{album.artist}</span>
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#121212', padding: '24px', borderRadius: '8px', minHeight: '200px' }}>
          <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '12px', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', textAlign: 'left' }}>Tracks List</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {albumTracks.map((track, index) => {
              const safeTrack = { 
                ...track, 
                itemType: 'song', 
                src: track.audioData || track.audioUrl || track.src || null 
              };
              
              return (
                <div key={track.id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '6px', backgroundColor: '#181818', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#a7a7a7', width: '20px', fontSize: '14px' }}>{index + 1}</span>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{track.title}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#b3b3b3', cursor: 'pointer' }} onClick={() => handleSelectArtist(track.artist || album.artist)}>{track.artist || album.artist}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        playSong(safeTrack, albumTracks.map(t => ({ ...t, itemType: 'song', src: t.audioData || t.audioUrl || t.src || null })).filter(t => t.id !== track.id));
                      }}
                      style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Play
                    </button>
                    <button onClick={() => setActiveTrackMenuId(activeTrackMenuId === track.id ? null : track.id)} style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                  </div>

                  {activeTrackMenuId === track.id && (
                    <div style={{ position: 'absolute', right: '16px', top: '50px', backgroundColor: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.7)', padding: '4px', minWidth: '160px' }}>
                      <div style={{ padding: '6px 8px', fontSize: '11px', color: '#a7a7a7', borderBottom: '1px solid #3e3e3e', fontWeight: 'bold', textAlign: 'left' }}>Add to playlist:</div>
                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {myPlaylists.map(p => (
                          <div key={p.id} onClick={() => handleAddToPlaylist(p.id, safeTrack)} style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '13px', color: '#fff', borderRadius: '4px', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <span>{p.title || p.name}</span>
                            <span>➕</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {albumTracks.length === 0 && <p style={{ color: '#b3b3b3', padding: '20px' }}>No tracks found in this album.</p>}
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

        <div style={{ padding: '0 24px', marginBottom: '1rem' }}>
          <Link to="/support" className="support-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#1db954', color: '#fff', padding: '8px 14px', margin: '10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #3e3e3e' }}>
            <LifeBuoy size={16} /> Contact Support
          </Link>
        </div>

        <div className="home-content" style={{ padding: '0 24px' }}>
          {location.pathname === '/playlists' && (
            selectedPlaylist ? (
              <PlaylistDetail playlist={selectedPlaylist} onBack={() => setSelectedPlaylist(null)} onSelectAlbum={(alb) => { setSelectedAlbum(alb); navigate('/albums'); }} onSelectArtist={handleSelectArtist} />
            ) : (
              <PlaylistManager currentUser={user} onSelectPlaylist={(p) => setSelectedPlaylist(p)} />
            )
          )}

          {location.pathname === '/singles' && (
            <MusicArchive onSelectAlbum={(alb) => { setSelectedAlbum(alb); navigate('/albums'); }} onSelectArtist={handleSelectArtist} />
          )}
          
          {location.pathname === '/albums' && (
            selectedAlbum ? (
              <AlbumDetailView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
            ) : (
              <MusicArchive onSelectAlbum={(album) => setSelectedAlbum(album)} onSelectArtist={handleSelectArtist} />
            )
          )}

          {(location.pathname === '/home' || location.pathname === '/') && (
            <>
              <NotificationsPanel currentUser={user} />
              <UnifiedShowcase title="Latest Playlists" items={latestPlaylists} type="playlist" />
              <UnifiedShowcase title="Latest Albums" items={latestAlbums} type="album" onSelect={(alb) => { setSelectedAlbum(alb); navigate('/albums'); }} />
              <UnifiedShowcase title="Most Played Songs" items={topSongsState} type="song" />
              <EarlyAccess items={earlyAccess} isGold={isGold} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;