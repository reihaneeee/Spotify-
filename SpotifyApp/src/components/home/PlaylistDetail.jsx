// src/components/home/PlaylistDetail.jsx
import React, { useState, useEffect } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { getSongs, getAlbums, getPublishedWorks } from '../../utils/mockData';
import { Music, ArrowLeft, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export default function PlaylistDetail({ playlist, onBack, onSelectAlbum, onSelectArtist }) {
  const { playSong } = usePlayback();
  const [currentSongsList, setCurrentSongsList] = useState(playlist.songs || []);
  
  const [trackSearch, setTrackSearch] = useState('');
  const [albumSearch, setAlbumSearch] = useState('');

  // استیت نگهداری آیدی آلبوم‌های باز شده (Expanded)
  const [expandedAlbumIds, setExpandedAlbumIds] = useState({});

  // استیت‌های مدیریت Rename درجا با کلیک روی نام پلی‌لیست
  const [isEditingName, setIsEditingName] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState(playlist.title || playlist.name || '');

  useEffect(() => {
    setPlaylistTitle(playlist.title || playlist.name || '');
    setIsEditingName(false);
    setCurrentSongsList(playlist.songs || []);
  }, [playlist.id, playlist.songs]);

  // تابع ثبت تغییر نام پلی‌لیست در لوکال استوریج با زدن دکمه اینتر
  const handleRenamePlaylist = () => {
    if (!playlistTitle.trim()) return;
    
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const updated = allPlaylists.map(p => {
      if (p.id === playlist.id) {
        return { 
          ...p, 
          title: playlistTitle.trim(), 
          name: playlistTitle.trim() 
        };
      }
      return p;
    });

    localStorage.setItem('playlists', JSON.stringify(updated));
    playlist.title = playlistTitle.trim(); 
    playlist.name = playlistTitle.trim();
    setIsEditingName(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenamePlaylist();
    } else if (e.key === 'Escape') {
      setPlaylistTitle(playlist.title || playlist.name || '');
      setIsEditingName(false);
    }
  };

  // تابع حذف قطعه صوتی یا آلبوم از همین پلی‌لیست فعلی و ذخیره در لوکال استوریج
  const handleRemoveTrackFromPlaylist = (itemId) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const updatedPlaylists = allPlaylists.map(p => {
      if (p.id === playlist.id) {
        const remainingSongs = (p.songs || []).filter(s => s.id !== itemId);
        return { ...p, songs: remainingSongs };
      }
      return p;
    });

    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    const filteredSongs = currentSongsList.filter(s => s.id !== itemId);
    setCurrentSongsList(filteredSongs);
    playlist.songs = filteredSongs; 
    alert('Item removed from this playlist.');
  };

  // جلوگیری از اضافه کردن آهنگ یا آلبوم تکراری به پلی‌لیست
  const handleAddItemToCurrentPlaylist = (item, isAlbum = false) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    
    if (currentSongsList.some(s => s.id === item.id)) {
      alert(`This ${isAlbum ? 'album' : 'track'} is already in this playlist!`);
      return;
    }

    const itemToAdd = {
      ...item,
      itemType: isAlbum ? 'album' : 'song',
      src: item.src || item.audioUrl || item.audioData || ''
    };

    const updatedPlaylists = allPlaylists.map(p => {
      if (p.id === playlist.id) {
        const currentSongs = p.songs || [];
        return { ...p, songs: [...currentSongs, itemToAdd] };
      }
      return p;
    });

    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    
    const updatedList = [...currentSongsList, itemToAdd];
    setCurrentSongsList(updatedList);
    playlist.songs = updatedList; 
    setTrackSearch('');
    setAlbumSearch('');
    alert('Added to playlist successfully!');
  };

  // یکپارچه‌سازی و همگام‌سازی کامل دیتای سرچ با منطق واکشی پویای موزیک آرشیو
  const getAllUnifiedData = () => {
    let publishedWorks = [];
    try {
      const storedWorks = localStorage.getItem('publishedWorks');
      publishedWorks = storedWorks ? JSON.parse(storedWorks) : getPublishedWorks();
    } catch (e) {
      publishedWorks = getPublishedWorks();
    }
    
    const mockSongs = getSongs();
    const userSongs = publishedWorks
      .filter(w => w.type === 'single' || w.type === 'track')
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
    const allSongs = [...mockSongs.map(s => ({ ...s, itemType: 'song', src: s.src || '' })), ...userSongs];

    const mockAlbums = getAlbums();
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
    const allAlbums = [...mockAlbums.map(a => ({ ...a, itemType: 'album' })), ...userAlbums];

    return { allSongs, allAlbums };
  };

  const { allSongs, allAlbums } = getAllUnifiedData();

  const searchedTracks = trackSearch ? allSongs.filter(s => s.title?.toLowerCase().includes(trackSearch.toLowerCase()) || s.artist?.toLowerCase().includes(trackSearch.toLowerCase())) : [];
  const searchedAlbums = albumSearch ? allAlbums.filter(a => a.title?.toLowerCase().includes(albumSearch.toLowerCase()) || a.artist?.toLowerCase().includes(albumSearch.toLowerCase())) : [];

  const toggleExpandAlbum = (albumId) => {
    setExpandedAlbumIds(prev => ({
      ...prev,
      [albumId]: !prev[albumId]
    }));
  };

  return (
    <div style={{ color: '#fff', direction: 'ltr', fontFamily: 'sans-serif', textAlign: 'left', padding: '0 32px 40px 32px', boxSizing: 'border-box' }}>
      
      <button 
        onClick={onBack} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          backgroundColor: '#242424', 
          color: '#fff', 
          border: '1px solid #3e3e3e', 
          padding: '6px 12px', 
          borderRadius: '20px', 
          cursor: 'pointer', 
          marginTop: '16px',
          marginBottom: '24px', 
          fontWeight: 'bold', 
          fontSize: '11px' 
        }}
      >
        <ArrowLeft size={13} /> Back to Playlists
      </button>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '30px' }}>
        <img src={playlist.cover || 'https://via.placeholder.com/150'} alt="" style={{ width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover' }} />
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954' }}>PLAYLIST</span>
          
          <div style={{ margin: '8px 0' }}>
            {isEditingName ? (
              <input
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleRenamePlaylist}
                autoFocus
                style={{
                  backgroundColor: '#242424',
                  border: '2px solid #1db954',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '32px',
                  fontWeight: '800',
                  padding: '4px 12px',
                  outline: 'none',
                  fontFamily: 'sans-serif',
                  width: '100%',
                  maxWidth: '400px'
                }}
              />
            ) : (
              <h2 
                onClick={() => setIsEditingName(true)}
                title="Click to rename"
                style={{ 
                  fontSize: '32px', 
                  margin: 0, 
                  fontWeight: '800', 
                  cursor: 'pointer',
                  display: 'inline-block',
                  borderBottom: '1px dashed transparent',
                  transition: 'border-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderBottomColor = '#1db954'}
                onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
              >
                {playlistTitle}
              </h2>
            )}
          </div>
          {/* 🛠️ مورد ۱: حذف کامل خط متنی "Created by: ..." برای خلوت شدن هدر */}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        
        {/* ستون سمت چپ: قطعات و آلبوم‌های داخل پلی‌لیست */}
        <div style={{ flex: 1, minWidth: '320px', backgroundColor: '#121212', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Tracks & Albums List</h3>
          {currentSongsList.length === 0 ? (
            <p style={{ color: '#b3b3b3', textAlign: 'center', padding: '20px' }}>This playlist is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentSongsList.map((item, idx) => {
                
                // رندر کانتینر آلبوم در پلی‌لیست
                if (item.itemType === 'album' || item.tracks) {
                  const isExpanded = !!expandedAlbumIds[item.id];
                  let subTracks = item.tracks || allSongs.filter(s => s.albumId === item.id || s.albumTitle === item.title);
                  
                  return (
                    <div 
                      key={item.id || idx} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        backgroundColor: '#1c1c1c', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        /* 🛠️ مورد ۲: تعریف ترانزیشن نرم و شیک برای افکت تغییر رنگ پس‌زمینه آلبوم در هنگام هوور ماوس */
                        transition: 'background-color 0.25s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222222'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1c1c1c'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ color: '#a7a7a7', width: '20px', fontWeight: 'bold', fontSize: '14px' }}>{idx + 1}</span>
                          
                          <div style={{ width: '46px', height: '46px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.cover || 'https://via.placeholder.com/150'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{item.title}</h5>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1db954', backgroundColor: 'rgba(29,185,84,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Album</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#b3b3b3' }}>{item.artist} • {subTracks.length} tracks</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button 
                            onClick={() => toggleExpandAlbum(item.id)}
                            style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#fff', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {isExpanded ? <><ChevronUp size={14}/> Collapse</> : <><ChevronDown size={14}/> Expand</>}
                          </button>
                          
                          <button 
                            onClick={() => handleRemoveTrackFromPlaylist(item.id)} 
                            style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#b3b3b3', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* آهنگ‌های داخل آلبوم باز شده با ساختار مینی‌کارت استاندارد */}
                      {isExpanded && (
                        <div style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #1db954' }}>
                          {subTracks.map((subTrack, subIdx) => {
                            const safeSub = { ...subTrack, itemType: 'song', src: subTrack.audioData || subTrack.audioUrl || subTrack.src || '' };
                            return (
                              <div 
                                key={subTrack.id || subIdx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  padding: '10px 14px', 
                                  backgroundColor: '#121212', 
                                  borderRadius: '8px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2222'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#121212'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden', flex: 1 }}>
                                  <span style={{ color: '#a7a7a7', fontSize: '12px', width: '15px', fontWeight: 'bold' }}>{subIdx + 1}</span>
                                  <div style={{ width: '38px', height: '38px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#282828', flexShrink: 0 }}>
                                    <img src={subTrack.cover || item.cover || 'https://via.placeholder.com/150'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                    <h6 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subTrack.title}</h6>
                                    <span style={{ fontSize: '11px', color: '#b3b3b3' }}>{subTrack.artist || item.artist}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => playSong(safeSub, subTracks.map(t => ({ ...t, itemType: 'song', src: t.audioData || t.audioUrl || t.src || '' })).filter(t => t.id !== subTrack.id))}
                                  style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '5px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                                >
                                  Play
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // رندر استاندارد ردیف تک‌آهنگ
                const safeTrack = { ...item, itemType: 'song', src: item.src || item.audioUrl || item.audioData || '' };
                return (
                  <div 
                    key={item.id || idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 16px', 
                      backgroundColor: '#181818', 
                      borderRadius: '8px', 
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      transition: 'background-color 0.25s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222222'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                      <span style={{ color: '#a7a7a7', width: '20px', fontWeight: 'bold', fontSize: '14px' }}>{idx + 1}</span>
                      
                      <div style={{ width: '46px', height: '46px', borderRadius: '4px', backgroundColor: '#282828', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                        {item.cover ? (
                          <img src={item.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Music size={20} style={{ color: '#535353' }} />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', overflow: 'hidden' }}>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span onClick={() => onSelectArtist && onSelectArtist(item.artistId || item.artist)} style={{ fontSize: '12px', color: '#b3b3b3', cursor: 'pointer' }}>
                            {item.artist}
                          </span>
                          {item.albumTitle && (
                            <span onClick={() => onSelectAlbum && onSelectAlbum({ title: item.albumTitle, artist: item.artist, id: item.albumId })} style={{ fontSize: '11px', color: '#1db954', cursor: 'pointer' }}>
                              • 💿 {item.albumTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <button 
                        onClick={() => playSong(safeTrack, currentSongsList.filter(t => !t.tracks && t.itemType !== 'album').map(t => ({ ...t, itemType: 'song', src: t.src || t.audioUrl || t.audioData || '' })).filter(t => t.id !== item.id))} 
                        style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        Play
                      </button>
                      <button 
                        onClick={() => handleRemoveTrackFromPlaylist(item.id)} 
                        style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#b3b3b3', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ستون سمت راست: باکس‌های جستجوی زنده دینامیک */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* باکس Search & Add Track */}
          <div style={{ backgroundColor: '#121212', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Search & Add Track</h4>
            <input 
              type="text" 
              placeholder="🔍 Track title..." 
              value={trackSearch}
              onChange={(e) => setTrackSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', backgroundColor: '#242424', border: '1px solid #3e3e3e', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            {searchedTracks.length > 0 && (
              <div style={{ backgroundColor: '#181818', borderRadius: '6px', marginTop: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #282828' }}>
                {searchedTracks.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #242424' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{t.title}</span>
                      <span style={{ fontSize: '11px', color: '#b3b3b3' }}>{t.artist}</span>
                    </div>
                    <button onClick={() => handleAddItemToCurrentPlaylist(t, false)} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* باکس Search & Add Album */}
          <div style={{ backgroundColor: '#121212', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Search & Add Album</h4>
            <input 
              type="text" 
              placeholder="🔍 Album title..." 
              value={albumSearch}
              onChange={(e) => setAlbumSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', backgroundColor: '#242424', border: '1px solid #3e3e3e', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            {searchedAlbums.length > 0 && (
              <div style={{ backgroundColor: '#181818', borderRadius: '6px', marginTop: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #282828' }}>
                {searchedAlbums.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #242424' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{a.title}</span>
                      <span style={{ fontSize: '11px', color: '#b3b3b3' }}>By {a.artist}</span>
                    </div>
                    <button onClick={() => handleAddItemToCurrentPlaylist(a, true)} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}