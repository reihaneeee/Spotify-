// src/components/home/MusicArchive.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSongs, getAlbums, getPublishedWorks } from '../../utils/mockData'; 
import { usePlayback } from '../../context/PlaybackContext';
import { Music, Play } from 'lucide-react'; 

export default function MusicArchive({ onSelectAlbum, onSelectArtist }) { 
  const { playSong } = usePlayback();
  const location = useLocation();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('plays'); 
  const [playlists, setPlaylists] = useState([]);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);
  
  const [animatingCardId, setAnimatingCardId] = useState(null);
  const [animationType, setAnimationType] = useState('add'); 
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const [currentSongsState, setCurrentSongsState] = useState([]);
  const [currentAlbumsState, setCurrentAlbumsState] = useState([]);
  const [isGoldUser, setIsGoldUser] = useState(false);

  const fetchAndSyncData = () => {
    const allSongs = getSongs();
    const allAlbums = getAlbums();
    
    const rawUser = localStorage.getItem('currentUser') || '{}';
    setIsGoldUser(JSON.parse(rawUser).subscription === 'gold');

    let publishedWorks = [];
    try {
      const storedWorks = localStorage.getItem('artist_works');
      publishedWorks = storedWorks ? JSON.parse(storedWorks) : getPublishedWorks();
    } catch (e) {
      publishedWorks = getPublishedWorks();
    }

    const userAlbums = publishedWorks
      .filter(w => w.type === 'album')
      .map(w => ({
        id: w.id,
        title: w.title,
        artist: w.artistName || 'Uploaded Artist',
        artistId: w.artistId,
        cover: w.cover && !w.cover.includes('placeholder') ? w.cover : null,
        year: w.releaseDate ? new Date(w.releaseDate).getFullYear() : new Date().getFullYear(),
        releaseDate: w.releaseDate || new Date().toISOString(),
        itemType: 'album',
        plays: w.plays || 0,
        uniqueUsers: w.uniqueUsers || [],
        tracks: w.tracks || []
      }));

    const userSongs = publishedWorks
      .filter(w => w.type === 'single' || w.type === 'track')
      .map(w => ({
        id: w.id,
        title: w.title,
        artist: w.artistName || 'artist6',
        artistId: w.artistId,
        cover: w.cover && !w.cover.includes('placeholder') ? w.cover : null,
        plays: w.plays || 0,
        uniqueUsers: w.uniqueUsers || [],
        duration: w.duration || 198,
        lyrics: w.lyrics || '',
        itemType: 'song',
        albumTitle: w.albumTitle || '', 
        albumId: w.albumId || '',
        releaseDate: w.releaseDate || new Date().toISOString(),
        src: w.audioUrl || w.audioData || '' 
      }));

    let extractedAlbumSongs = [];
    userAlbums.forEach(album => {
      if (album.tracks && Array.isArray(album.tracks)) {
        album.tracks.forEach(track => {
          extractedAlbumSongs.push({
            id: track.id,
            title: track.title,
            artist: track.artist || album.artist,
            artistId: album.artistId,
            cover: track.cover || album.cover,
            plays: track.plays || 0,
            uniqueUsers: track.uniqueUsers || [],
            itemType: 'song',
            albumTitle: album.title,
            albumId: album.id,
            releaseDate: album.releaseDate,
            src: track.audioData || track.audioUrl || track.src || ''
          });
        });
      }
    });

    allSongs.forEach(song => {
      if (song.albumId || song.albumTitle) {
        if (!extractedAlbumSongs.some(e => e.id === song.id)) {
          extractedAlbumSongs.push({
            ...song,
            itemType: 'song',
            plays: song.plays || 0,
            uniqueUsers: song.uniqueUsers || [],
            releaseDate: song.year ? `${song.year}-01-01` : '2020-01-01'
          });
        }
      }
    });

    const finalSongs = [
      ...allSongs.map(s => ({ ...s, itemType: 'song', src: s.src || '', plays: s.plays || 0, uniqueUsers: s.uniqueUsers || [], releaseDate: s.year ? `${s.year}-01-01` : '2020-01-01' })),
      ...userSongs,
      ...extractedAlbumSongs
    ];

    const uniqueSongIds = new Set();
    const filteredSongsList = finalSongs.filter(s => {
      if (uniqueSongIds.has(s.id)) return false;
      uniqueSongIds.add(s.id);
      return true;
    });

    const finalAlbums = [
      ...allAlbums.map(a => ({ ...a, itemType: 'album', plays: a.plays || 0, uniqueUsers: a.uniqueUsers || [], releaseDate: a.year ? `${a.year}-01-01` : '2020-01-01' })),
      ...userAlbums
    ];

    setCurrentSongsState(filteredSongsList);
    setCurrentAlbumsState(finalAlbums);
  };

  useEffect(() => {
    fetchAndSyncData();
  }, [location.pathname]);

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
    setPlaylists(userPlaylists);
  }, [activeMenuSongId]);

  let displayItems = [];
  if (location.pathname === '/singles') {
    displayItems = currentSongsState;
  } else if (location.pathname === '/albums') {
    displayItems = currentAlbumsState;
  } else {
    displayItems = [...currentSongsState, ...currentAlbumsState];
  }

  const filteredItems = displayItems.filter(item => {
    return item.title?.toLowerCase().includes(search.toLowerCase()) || 
           (item.artist && item.artist.toLowerCase().includes(search.toLowerCase()));
  }).sort((a, b) => {
    if (sortBy === 'plays') return b.plays - a.plays;
    if (sortBy === 'date') {
      return new Date(b.releaseDate || b.year || 0) - new Date(a.releaseDate || a.year || 0);
    }
    return a.title?.localeCompare(b.title);
  });

  const toggleTrackInPlaylist = (playlistId, item, isAlreadyAdded) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const updated = allPlaylists.map(p => {
      if (p.id === playlistId) {
        const currentSongs = p.songs || [];
        if (isAlreadyAdded) {
          return { ...p, songs: currentSongs.filter(s => s.id !== item.id) };
        } else {
          return { ...p, songs: [...currentSongs, { ...item, itemType: item.itemType }] };
        }
      }
      return p;
    });
    
    localStorage.setItem('playlists', JSON.stringify(updated));
    setActiveMenuSongId(null);
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songs: isAlreadyAdded ? (p.songs || []).filter(s => s.id !== item.id) : [...(p.songs || []), item] } : p));
    setAnimationType(isAlreadyAdded ? 'remove' : 'add');
    setAnimatingCardId(item.id);
    setTimeout(() => setAnimatingCardId(null), 800);
  };

  const handleAlbumLinkClick = (albumTitle, artistName, albumId) => {
    const foundAlbum = currentAlbumsState.find(al => al.id === albumId || al.title?.toLowerCase() === albumTitle?.toLowerCase());
    if (foundAlbum && onSelectAlbum) {
      onSelectAlbum(foundAlbum);
    } else if (onSelectAlbum) {
      onSelectAlbum({ id: albumId || `dyn_key_${albumTitle}`, title: albumTitle, artist: artistName, cover: '' });
    }
  };

  /* 🛠️ پیاده‌سازی متد جاافتاده handleCardClick برای مدیریت کلیک روی قطعات صوتی و آلبوم‌ها */
  const handleCardClick = (item) => {
    const rawUser = localStorage.getItem('currentUser') || '{}';
    const activeUsername = JSON.parse(rawUser).username || 'anonymous';

    if (item.itemType === 'song') {
      const localSongs = JSON.parse(localStorage.getItem('songs') || '[]');
      if (localSongs.some(s => s.id === item.id)) {
        const updatedSongs = localSongs.map(s => {
          if (s.id === item.id) {
            const users = s.uniqueUsers || [];
            if (!users.includes(activeUsername)) users.push(activeUsername);
            return { ...s, plays: (s.plays || 0) + 1, uniqueUsers: users };
          }
          return s;
        });
        localStorage.setItem('songs', JSON.stringify(updatedSongs));
      }

      const storedWorks = JSON.parse(localStorage.getItem('artist_works') || '[]');
      let isWorkUpdated = false;

      const updatedWorks = storedWorks.map(w => {
        if (w.id === item.id) {
          const users = w.uniqueUsers || [];
          if (!users.includes(activeUsername)) users.push(activeUsername);
          isWorkUpdated = true;
          return { ...w, plays: (w.plays || 0) + 1, uniqueUsers: users };
        }
        if (w.type === 'album' && w.tracks) {
          const updatedTracks = w.tracks.map(t => {
            if (t.id === item.id) {
              const users = t.uniqueUsers || [];
              if (!users.includes(activeUsername)) users.push(activeUsername);
              isWorkUpdated = true;
              return { ...t, plays: (t.plays || 0) + 1, uniqueUsers: users };
            }
            return t;
          });
          return { ...w, tracks: updatedTracks };
        }
        return w;
      });

      if (isWorkUpdated) {
        localStorage.setItem('artist_works', JSON.stringify(updatedWorks));
      }

      fetchAndSyncData();
      playSong(item, currentSongsState.filter(s => s.id !== item.id));

    } else {
      const localAlbums = JSON.parse(localStorage.getItem('albums') || '[]');
      if (localAlbums.some(a => a.id === item.id)) {
        const updatedAlbs = localAlbums.map(a => {
          if (a.id === item.id) {
            const users = a.uniqueUsers || [];
            if (!users.includes(activeUsername)) users.push(activeUsername);
            return { ...a, plays: (a.plays || 0) + 1, uniqueUsers: users };
          }
          return a;
        });
        localStorage.setItem('albums', JSON.stringify(updatedAlbs));
      }

      const storedWorks = JSON.parse(localStorage.getItem('artist_works') || '[]');
      const updatedWorks = storedWorks.map(w => {
        if (w.id === item.id && w.type === 'album') {
          const users = w.uniqueUsers || [];
          if (!users.includes(activeUsername)) users.push(activeUsername);
          return { ...w, plays: (w.plays || 0) + 1, uniqueUsers: users };
        }
        return w;
      });
      localStorage.setItem('artist_works', JSON.stringify(updatedWorks));

      fetchAndSyncData();
      if (onSelectAlbum) onSelectAlbum(item);
    }
  };

  return (
    <div style={{ padding: '30px 24px', color: '#fff', direction: 'ltr', fontFamily: 'sans-serif' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        {location.pathname === '/singles' && '🎵 Independent & Album Singles'}
        {location.pathname === '/albums' && '🗂️ Released Albums'}
      </h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', maxWidth: '600px' }}>
        <input type="text" placeholder="Search track or artist..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: '20px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', flex: 1.5, fontSize: '14px', outline: 'none' }} />
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', outline: 'none' }}>
          <option value="plays">Sort by: Most Played</option>
          <option value="date">Sort by: Release Date</option>
          <option value="title">Sort by: Alphabetical</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
        {filteredItems.map(item => {
          const isAnimating = animatingCardId === item.id;
          const isHovered = hoveredCardId === item.id;
          const targetBgColor = animationType === 'add' ? '#144c27' : '#5c1515';
          const targetBorderColor = animationType === 'add' ? '#1db954' : '#e91429';

          let currentBgColor = isAnimating ? targetBgColor : (isHovered ? '#242424' : '#181818');

          return (
            <div 
              key={item.id} 
              onClick={() => handleCardClick(item)}
              onMouseEnter={() => setHoveredCardId(item.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                position: 'relative',
                backgroundColor: currentBgColor, 
                border: isAnimating ? `1px solid ${targetBorderColor}` : '1px solid transparent',
                transition: 'background-color 0.25s ease, border 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '370px',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', marginBottom: '14px', backgroundColor: '#282828', borderRadius: '6px', overflow: 'hidden' }}>
                  {item.cover ? <img src={item.cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Music size={44} style={{ color: '#535353' }} /></div>}
                  
                  {item.itemType === 'song' && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: isHovered ? '12px' : '-50px', 
                        right: '12px', 
                        backgroundColor: '#1db954', 
                        borderRadius: '50%', 
                        width: '42px', 
                        height: '42px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'scale(1)' : 'scale(0.6)',
                        opacity: isHovered ? 1 : 0,
                        zIndex: 3
                      }}
                    >
                      <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
                    </div>
                  )}
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                
                <p 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectArtist) onSelectArtist(item.artistId || item.artist);
                  }}
                  style={{ color: '#b3b3b3', fontSize: '13px', margin: '0 0 6px 0', cursor: 'pointer', display: 'inline-block', position: 'relative', zIndex: 2 }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {item.artist || 'Spotify Artist'}
                </p>

                {item.itemType === 'song' && (item.albumTitle || item.albumId) && (
                  <div style={{ margin: '4px 0 6px 0' }}>
                    <p 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlbumLinkClick(item.albumTitle, item.artist, item.albumId);
                      }}
                      style={{ color: '#1db954', fontSize: '11px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%', position: 'relative', zIndex: 2 }}
                      onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      💿 {item.albumTitle || 'View Album'}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto' }}>
                {isGoldUser && (
                  <div style={{ fontSize: '11px', color: '#6a6a6a', marginBottom: '8px', textAlign: 'left' }}>
                    <span>{item.plays || 0} plays</span> • <span>{(item.uniqueUsers || []).length} listeners</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setActiveMenuSongId(activeMenuSongId === item.id ? null : item.id);
                    }} 
                    style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', position: 'relative', zIndex: 2 }}
                  >
                    +
                  </button>
                </div>
              </div>

              {activeMenuSongId === item.id && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  style={{ position: 'absolute', bottom: '56px', left: '16px', right: '16px', backgroundColor: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.7)', padding: '4px' }}
                >
                  <div style={{ padding: '6px 8px', fontSize: '11px', color: '#a7a7a7', borderBottom: '1px solid #3e3e3e', fontWeight: 'bold' }}>Add to playlist:</div>
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {playlists.map(p => {
                      const isAdded = (p.songs || []).some(s => s.id === item.id);
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => toggleTrackInPlaylist(p.id, item, isAdded)} 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', cursor: 'pointer', fontSize: '13px', color: '#fff', borderRadius: '4px', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || p.name}</span>
                          <span>{isAdded ? '❌' : '➕'}</span>
                        </div>
                      );
                    })}
                    {playlists.length === 0 && <div style={{ padding: '8px', fontSize: '12px', color: '#b3b3b3' }}>No playlists found</div>}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}