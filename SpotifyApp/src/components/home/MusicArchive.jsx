// src/components/home/MusicArchive.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayback } from '../../context/PlaybackContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { fetchSongs, fetchAlbums } from '../../services/catalogApi';
import { fetchMyPlaylists, addTrackToPlaylist, removeTrackFromPlaylist } from '../../services/playlistApi';
import { Music, Play } from 'lucide-react';

const ORDERING_MAP = {
  plays: '-_play_count',
  date: '-release_date',
  title: 'title',
};

export default function MusicArchive({ onSelectAlbum, onSelectArtist }) {
  const { playSong } = usePlayback();
  const { isGold } = useSubscription();
  const { user, updateUser } = useAuth();
  const location = useLocation();

  const isAlbumPage = location.pathname === '/albums';

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(() => {
    const userPref = isAlbumPage ? user?.album_sort_by : user?.song_sort_by;
    const localPref = localStorage.getItem(isAlbumPage ? 'album_sort_by' : 'song_sort_by');
    return userPref || localPref || 'plays';
  });

  const [playlists, setPlaylists] = useState([]);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);

  const [animatingCardId, setAnimatingCardId] = useState(null);
  const [animationType, setAnimationType] = useState('add');
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);

  // همگام‌سازی مرتب‌سازی هنگام تغییر کاربر یا مسیر
  useEffect(() => {
    const userPref = isAlbumPage ? user?.album_sort_by : user?.song_sort_by;
    if (userPref) {
      setSortBy(userPref);
    }
  }, [user, location.pathname, isAlbumPage]);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);

    const fieldKey = isAlbumPage ? 'album_sort_by' : 'song_sort_by';
    localStorage.setItem(fieldKey, newSort);

    if (user) {
      updateUser({ [fieldKey]: newSort });
    }
  };

  const fetchAndSyncData = useCallback(async () => {
    const ordering = ORDERING_MAP[sortBy] || '-_play_count';
    if (location.pathname === '/albums') {
      setAlbums(await fetchAlbums({ search, ordering }));
    } else if (location.pathname === '/singles') {
      setSongs(await fetchSongs({ search, ordering }));
    } else {
      const [s, a] = await Promise.all([
        fetchSongs({ search, ordering }),
        fetchAlbums({ search, ordering }),
      ]);
      setSongs(s);
      setAlbums(a);
    }
  }, [location.pathname, search, sortBy]);

  useEffect(() => {
    fetchAndSyncData();
  }, [fetchAndSyncData]);

  useEffect(() => {
    fetchMyPlaylists().then(({ playlists: list }) => setPlaylists(list));
  }, [activeMenuSongId]);

  const displayItems = [
    ...songs.map((s) => ({ ...s, itemType: 'song', artist: s.artist_detail?.public_name || s.artist_detail?.username })),
    ...albums.map((a) => ({ ...a, itemType: 'album', artist: a.artist_detail?.public_name || a.artist_detail?.username })),
  ];

  const toggleTrackInPlaylist = async (playlistId, item, isAlreadyAdded) => {
    if (isAlreadyAdded) {
      await removeTrackFromPlaylist(playlistId, item.id);
    } else {
      await addTrackToPlaylist(playlistId, item.id);
    }
    setActiveMenuSongId(null);
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        const songs = p.songs || [];
        return {
          ...p,
          songs: isAlreadyAdded ? songs.filter((s) => s.id !== item.id) : [...songs, item],
          song_count: isAlreadyAdded ? Math.max((p.song_count || 1) - 1, 0) : (p.song_count || 0) + 1,
        };
      })
    );
    setAnimationType(isAlreadyAdded ? 'remove' : 'add');
    setAnimatingCardId(item.id);
    setTimeout(() => setAnimatingCardId(null), 800);
  };

  const handleAlbumLinkClick = (albumTitle, artistName, albumId) => {
    const foundAlbum = albums.find((al) => al.id === albumId || al.title?.toLowerCase() === albumTitle?.toLowerCase());
    if (foundAlbum && onSelectAlbum) {
      onSelectAlbum(foundAlbum);
    } else if (onSelectAlbum) {
      onSelectAlbum({ id: albumId, title: albumTitle, artist: artistName, cover_image: '' });
    }
  };

  const handleCardClick = (item) => {
    if (item.itemType === 'song') {
      playSong(
        { ...item, src: item.audio_file },
        songs.filter((s) => s.id !== item.id).map((s) => ({ ...s, src: s.audio_file }))
      );
      setTimeout(fetchAndSyncData, 400);
    } else if (onSelectAlbum) {
      onSelectAlbum(item);
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

        <select value={sortBy} onChange={handleSortChange} style={{ padding: '10px 16px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', outline: 'none' }}>
          <option value="plays">Sort by: Most Played</option>
          <option value="date">Sort by: Release Date</option>
          <option value="title">Sort by: Alphabetical</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
        {displayItems.map((item) => {
          const isAnimating = animatingCardId === item.id;
          const isHovered = hoveredCardId === item.id;
          const targetBgColor = animationType === 'add' ? '#144c27' : '#5c1515';
          const targetBorderColor = animationType === 'add' ? '#1db954' : '#e91429';
          const currentBgColor = isAnimating ? targetBgColor : isHovered ? '#242424' : '#181818';
          const cover = item.cover_image || item.cover;

          return (
            <div
              key={`${item.itemType}-${item.id}`}
              onClick={() => handleCardClick(item)}
              onMouseEnter={() => setHoveredCardId(item.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                padding: '16px', borderRadius: '8px', position: 'relative', backgroundColor: currentBgColor,
                border: isAnimating ? `1px solid ${targetBorderColor}` : '1px solid transparent',
                transition: 'background-color 0.25s ease, border 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: '370px', boxSizing: 'border-box',
              }}
            >
              <div>
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', marginBottom: '14px', backgroundColor: '#282828', borderRadius: '6px', overflow: 'hidden' }}>
                  {cover ? <img src={cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Music size={44} style={{ color: '#535353' }} /></div>}

                  {item.itemType === 'song' && (
                    <div style={{
                      position: 'absolute', bottom: isHovered ? '12px' : '-50px', right: '12px', backgroundColor: '#1db954',
                      borderRadius: '50%', width: '42px', height: '42px', display: 'flex', justifyContent: 'center',
                      alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isHovered ? 'scale(1)' : 'scale(0.6)',
                      opacity: isHovered ? 1 : 0, zIndex: 3,
                    }}>
                      <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
                    </div>
                  )}
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>

                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectArtist) onSelectArtist(item.artist_detail?.id ?? item.artist);
                  }}
                  style={{ color: '#b3b3b3', fontSize: '13px', margin: '0 0 6px 0', cursor: 'pointer', display: 'inline-block', position: 'relative', zIndex: 2 }}
                  onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {item.artist || 'Spotify Artist'}
                </p>

                {item.itemType === 'song' && item.album_title && (
                  <div style={{ margin: '4px 0 6px 0' }}>
                    <p
                      onClick={(e) => { e.stopPropagation(); handleAlbumLinkClick(item.album_title, item.artist, item.album); }}
                      style={{ color: '#1db954', fontSize: '11px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%', position: 'relative', zIndex: 2 }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      💿 {item.album_title}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto' }}>
                {isGold && (
                  <div style={{ fontSize: '11px', color: '#6a6a6a', marginBottom: '8px', textAlign: 'left' }}>
                    <span>{item.play_count || 0} plays</span> • <span>{item.unique_listeners_count || 0} listeners</span>
                  </div>
                )}

                {item.itemType === 'song' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenuSongId(activeMenuSongId === item.id ? null : item.id); }}
                      style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', position: 'relative', zIndex: 2 }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {activeMenuSongId === item.id && (
                <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '56px', left: '16px', right: '16px', backgroundColor: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.7)', padding: '4px' }}>
                  <div style={{ padding: '6px 8px', fontSize: '11px', color: '#a7a7a7', borderBottom: '1px solid #3e3e3e', fontWeight: 'bold' }}>Add to playlist:</div>
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {playlists.map((p) => {
                      const isAdded = (p.songs || []).some((s) => s.id === item.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleTrackInPlaylist(p.id, item, isAdded)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', cursor: 'pointer', fontSize: '13px', color: '#fff', borderRadius: '4px', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3e3e3e')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
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