// src/components/home/MusicArchive.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSongs, getAlbums, getPublishedWorks } from '../../utils/mockData'; 
import { usePlayback } from '../../context/PlaybackContext';
import { Music } from 'lucide-react'; 

export default function MusicArchive({ onSelectAlbum, onSelectArtist }) { 
  const { playSong } = usePlayback();
  const location = useLocation();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('plays');
  const [playlists, setPlaylists] = useState([]);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);
  
  const [animatingCardId, setAnimatingCardId] = useState(null);
  const [animationType, setAnimationType] = useState('add'); 

  const allSongs = getSongs();
  const allAlbums = getAlbums();
  const publishedWorks = getPublishedWorks(); 

  // بارگذاری دقیق پلی‌لیست‌ها برای استفاده در پاپ‌آپ دکمه +
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

  const userAlbums = publishedWorks
    .filter(w => w.type === 'album')
    .map(w => ({
      id: w.id,
      title: w.title,
      artist: w.artistName || 'Uploaded Artist',
      artistId: w.artistId,
      cover: w.cover && !w.cover.includes('placeholder') ? w.cover : null,
      year: w.releaseDate ? new Date(w.releaseDate).getFullYear() : new Date().getFullYear(),
      itemType: 'album',
      plays: w.plays || 0,
      tracks: w.tracks || []
    }));

  const userSongs = publishedWorks
    .filter(w => w.type === 'single')
    .map(w => ({
      id: w.id,
      title: w.title,
      artist: w.artistName || 'artist6',
      artistId: w.artistId,
      cover: w.cover && !w.cover.includes('placeholder') ? w.cover : null,
      plays: w.plays || 0,
      duration: w.duration || 198,
      lyrics: w.lyrics || '',
      itemType: 'song',
      albumTitle: w.albumTitle || '', 
      src: w.audioUrl || w.audioData || '' 
    }));

  let displayItems = [];
  
  if (location.pathname === '/singles') {
    displayItems = [
      ...allSongs.filter(song => !song.albumId).map(s => ({ ...s, itemType: 'song', src: s.src || '' })),
      ...userSongs 
    ];
  } else if (location.pathname === '/albums') {
    displayItems = [
      ...allAlbums.map(a => ({ ...a, itemType: 'album', plays: a.trackCount ? a.trackCount * 100000 : 500000 })),
      ...userAlbums 
    ];
  } else {
    displayItems = [
      ...allSongs.map(s => ({ ...s, itemType: 'song', src: s.src || '' })),
      ...userSongs,
      ...allAlbums.map(a => ({ ...a, itemType: 'album', plays: (a.trackCount || 5) * 100000 })),
      ...userAlbums
    ];
  }

  const filteredItems = displayItems.filter(item => {
    return item.title.toLowerCase().includes(search.toLowerCase()) || 
           (item.artist && item.artist.toLowerCase().includes(search.toLowerCase()));
  }).sort((a, b) => {
    if (sortBy === 'plays') return b.plays - a.plays;
    return a.title.localeCompare(b.title);
  });

  // 🛠️ فیکس نهایی و کامل تابع افزودن/حذف از پلی‌لیست همراه با انیمیشن موفقیت‌آمیز
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
    
    setTimeout(() => {
      setAnimatingCardId(null);
    }, 800);
  };

  const handleAlbumLinkClick = (albumTitle, artistName) => {
    const foundAlbum = allAlbums.find(al => al.title === albumTitle) || userAlbums.find(al => al.title === albumTitle);
    if (foundAlbum && onSelectAlbum) {
      onSelectAlbum(foundAlbum);
    } else if (onSelectAlbum) {
      onSelectAlbum({ id: `dyn_key_${albumTitle}`, title: albumTitle, artist: artistName, cover: '' });
    }
  };

  return (
    <div style={{ padding: '30px 24px', color: '#fff', direction: 'ltr', fontFamily: 'sans-serif' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        {location.pathname === '/singles' && '🎵 Independent Singles'}
        {location.pathname === '/albums' && '🗂️ Released Albums'}
      </h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', maxWidth: '600px' }}>
        <input type="text" placeholder="Search track or artist..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: '20px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', flex: 1.5, fontSize: '14px', outline: 'none' }} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', borderRadius: '20px', cursor: 'pointer', fontSize: '14px' }}>
          <option value="plays">Sort by: Most Played</option>
          <option value="title">Sort by: Alphabetical</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
        {filteredItems.map(item => {
          const isAnimating = animatingCardId === item.id;
          const targetBgColor = animationType === 'add' ? '#144c27' : '#5c1515';
          const targetBorderColor = animationType === 'add' ? '#1db954' : '#e91429';

          return (
            <div 
              key={item.id} 
              style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                position: 'relative',
                backgroundColor: isAnimating ? targetBgColor : '#181818', 
                border: isAnimating ? `1px solid ${targetBorderColor}` : '1px solid transparent',
                transition: 'background-color 0.2s ease, border 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '100%', marginBottom: '14px', backgroundColor: '#282828', borderRadius: '6px', overflow: 'hidden' }}>
                {item.cover ? <img src={item.cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Music size={44} style={{ color: '#535353' }} /></div>}
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
              
              <p 
                onClick={() => onSelectArtist && onSelectArtist(item.artistId || item.artist)}
                style={{ color: '#b3b3b3', fontSize: '13px', margin: '0 0 4px 0', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {item.artist || 'Spotify Artist'}
              </p>

              {item.itemType === 'song' && item.albumTitle && (
                <p 
                  onClick={() => handleAlbumLinkClick(item.albumTitle, item.artist)}
                  style={{ color: '#1db954', fontSize: '11px', margin: '0 0 12px 0', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  💿 {item.albumTitle}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {item.itemType === 'song' ? (
                  <button onClick={() => playSong(item, displayItems.filter(s => s.itemType === 'song' && s.id !== item.id))} style={{ flex: 1, backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Play</button>
                ) : (
                  <button onClick={() => onSelectAlbum && onSelectAlbum(item)} style={{ flex: 1, backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#fff', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>View Album</button>
                )}
                {/* 🛠️ دکمه پلاس فعال شده */}
                <button onClick={() => setActiveMenuSongId(activeMenuSongId === item.id ? null : item.id)} style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>

              {/* 🛠️ رندر منوی پاپ‌آپ پلی‌لیست‌ها با استیت و دیتای فیکس شده */}
              {activeMenuSongId === item.id && (
                <div style={{ position: 'absolute', bottom: '56px', left: '16px', right: '16px', backgroundColor: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.7)', padding: '4px' }}>
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