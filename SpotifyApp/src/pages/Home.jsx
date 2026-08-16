// src/pages/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import { usePlayback } from '../context/PlaybackContext'; 
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import EarlyAccess from '../components/home/EarlyAccess';
import { LifeBuoy, ArrowLeft, Music, Play } from 'lucide-react';

import { fetchSongs, fetchAlbums, fetchAlbum } from '../services/catalogApi';
import { fetchMyPlaylists, addTrackToPlaylist } from '../services/playlistApi';

import '../styles/home.css';

import NotificationsPanel from '../components/home/NotificationsPanel';
import PlaylistManager from '../components/home/PlaylistManager';
import MusicArchive from '../components/home/MusicArchive';
import PlaylistDetail from '../components/home/PlaylistDetail';

function Home() {
  const { notification, clearNotification, user: authUser } = useAuth();
  const { playSong } = usePlayback(); 
  const location = useLocation(); 
  const navigate = useNavigate();

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null); 
  const [user, setUser] = useState(authUser);

  const [topSongsState, setTopSongsState] = useState([]);
  const [latestAlbumsState, setLatestAlbumsState] = useState([]);
  const [latestPlaylistsState, setLatestPlaylistsState] = useState([]);

  // دریافت داده‌های واقعی از بک‌اند
  const loadHomeData = useCallback(async () => {
    try {
      const [songsData, albumsData, playlistsRes] = await Promise.all([
        fetchSongs({ ordering: '-_play_count' }),
        fetchAlbums({ ordering: '-release_date' }),
        fetchMyPlaylists()
      ]);

      setTopSongsState(songsData || []);
      setLatestAlbumsState(albumsData || []);
      setLatestPlaylistsState(playlistsRes?.playlists || []);
    } catch (err) {
      console.error('Error loading real home data:', err);
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }
    setUser(authUser);
    loadHomeData();
  }, [authUser, location.pathname, navigate, loadHomeData]);

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

  const handleSelectArtist = (artistId) => {
    if (artistId) {
      navigate(`/artist/${artistId}`);
    }
  };

  const getArtistDisplayName = (item) => {
    return item.artist_detail?.public_name || item.artist_detail?.username || item.artist || 'Unknown Artist';
  };

  if (!user) return null;

  const isGold = user?.subscription === 'gold' || user?.subscription?.plan === 'gold';

  const UnifiedShowcase = ({ title, items, type, onSelect }) => {
    const [hoveredId, setHoveredId] = useState(null);

    const handleItemClick = (item) => {
      if (type === 'song') {
        const playableSong = { ...item, src: item.audio_file || item.src };
        const playableQueue = items.map(s => ({ ...s, src: s.audio_file || s.src }));
        playSong(playableSong, playableQueue);
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
            const cover = item.cover_image || item.cover;
            const artistName = getArtistDisplayName(item);
            const artistId = item.artist_detail?.id || item.artist_id || item.artist;

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
                  {cover ? (
                    <img src={cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Music size={44} style={{ color: '#535353' }} />
                    </div>
                  )}
                  
                  {type === 'song' && (
                    <div style={{ position: 'absolute', bottom: isHovered ? '12px' : '-50px', right: '12px', backgroundColor: '#1db954', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isHovered ? 'scale(1)' : 'scale(0.6)', opacity: isHovered ? 1 : 0, zIndex: 3 }}>
                      <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
                    </div>
                  )}
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
                  {item.title || item.name}
                </h4>

                <p 
                  onClick={(e) => {
                    if (type !== 'playlist') {
                      e.stopPropagation();
                      handleSelectArtist(artistId);
                    }
                  }}
                  style={{ color: '#b3b3b3', fontSize: '13px', margin: 0, cursor: type !== 'playlist' ? 'pointer' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseOver={(e) => { if(type !== 'playlist') e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseOut={(e) => { if(type !== 'playlist') e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {type === 'playlist' ? `${item.song_count || item.songs?.length || 0} tracks` : artistName}
                </p>

                {type === 'song' && (
                  <div style={{ fontSize: '11px', color: '#6a6a6a', marginTop: '4px' }}>
                    {item.play_count ?? item.plays ?? 0} plays • {item.unique_listeners_count ?? item.uniqueUsers?.length ?? 0} listeners
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
    const [fullAlbumData, setFullAlbumData] = useState(album);

    useEffect(() => {
      fetchMyPlaylists().then(res => setMyPlaylists(res?.playlists || []));
      if (album?.id) {
        fetchAlbum(album.id).then(data => setFullAlbumData(data)).catch(() => setFullAlbumData(album));
      }
    }, [album]);

    const albumTracks = fullAlbumData.tracks || fullAlbumData.songs || [];
    const cover = fullAlbumData.cover_image || fullAlbumData.cover;
    const artistName = getArtistDisplayName(fullAlbumData);

    const handleAddToPlaylist = async (playlistId, track) => {
      try {
        await addTrackToPlaylist(playlistId, track.id);
        setActiveTrackMenuId(null);
        alert('Track added to playlist successfully!');
      } catch (err) {
        alert(err?.response?.data?.detail || 'Failed to add track to playlist');
      }
    };

    return (
      <div style={{ padding: '20px', color: '#fff', direction: 'ltr', fontFamily: 'sans-serif' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <img src={cover || 'https://picsum.photos/300'} alt="" style={{ width: '180px', height: '180px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', objectFit: 'cover' }} />
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954', backgroundColor: '#181818', padding: '4px 10px', borderRadius: '12px' }}>ALBUM</span>
            <h2 style={{ fontSize: '36px', margin: '12px 0 6px 0', fontWeight: '900', letterSpacing: '-1px' }}>{fullAlbumData.title}</h2>
            <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              Artist: <span style={{ color: '#1db954', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleSelectArtist(fullAlbumData.artist_detail?.id || fullAlbumData.artist)}>{artistName}</span>
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
                src: track.audio_file || track.audioData || track.audioUrl || track.src
              };
              
              return (
                <div key={track.id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '6px', backgroundColor: '#181818', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#a7a7a7', width: '20px', fontSize: '14px' }}>{index + 1}</span>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{track.title}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#b3b3b3', cursor: 'pointer' }} onClick={() => handleSelectArtist(track.artist_detail?.id || track.artist)}>{getArtistDisplayName(track) || artistName}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        playSong(safeTrack, albumTracks.map(t => ({ ...t, itemType: 'song', src: t.audio_file || t.audioData || t.audioUrl || t.src })));
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
              <UnifiedShowcase title="Latest Playlists" items={latestPlaylistsState} type="playlist" />
              <UnifiedShowcase title="Latest Albums" items={latestAlbumsState} type="album" onSelect={(alb) => { setSelectedAlbum(alb); navigate('/albums'); }} />
              <UnifiedShowcase title="Most Played Songs" items={topSongsState} type="song" />
              <EarlyAccess items={[]} isGold={isGold} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;