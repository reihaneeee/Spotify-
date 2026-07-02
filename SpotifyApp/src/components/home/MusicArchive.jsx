// src/components/home/MusicArchive.jsx
import React, { useState, useEffect } from 'react';
import { getSongs, getAlbums } from '../../utils/mockData';
import { usePlayback } from '../../context/PlaybackContext';

export default function MusicArchive() {
  const { playSong } = usePlayback();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, song, album
  const [sortBy, setSortBy] = useState('plays'); // plays, title
  const [playlists, setPlaylists] = useState([]);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);

  const songs = getSongs();
  const albums = getAlbums();

  useEffect(() => {
    setPlaylists(JSON.parse(localStorage.getItem('playlists') || '[]'));
  }, [activeMenuSongId]);

  const combinedItems = [
    ...songs.map(s => ({ ...s, itemType: 'song' })),
    ...albums.map(a => ({ ...a, itemType: 'album', plays: a.trackCount * 100000 })) // شبیه‌سازی برای آلبوم
  ];

  const filteredItems = combinedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          (item.artist && item.artist.toLowerCase().includes(search.toLowerCase()));
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && item.itemType === filterType;
  }).sort((a, b) => {
    if (sortBy === 'plays') return b.plays - a.plays;
    return a.title.localeCompare(b.title);
  });

  const addSongToPlaylist = (playlistId, song) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const updated = allPlaylists.map(p => {
      if (p.id === playlistId) {
        const currentSongs = p.songs || [];
        if (currentSongs.some(s => s.id === song.id)) return p;
        return { ...p, songs: [...currentSongs, song] };
      }
      return p;
    });
    localStorage.setItem('playlists', JSON.stringify(updated));
    setActiveMenuSongId(null);
    alert('آهنگ به پلی‌لیست اضافه شد.');
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h3>آرشیو و جستجوی موسیقی سامانه</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" placeholder="جستجو بر اساس نام اثر یا هنرمند..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#181818', color: '#fff', border: '1px solid #444', flex: 1 }}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '10px', backgroundColor: '#181818', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>
          <option value="all">همه آثار</option>
          <option value="song">تک آهنگ‌ها</option>
          <option value="album">آلبوم‌ها</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px', backgroundColor: '#181818', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>
          <option value="plays">مرتب‌سازی: تعداد شنونده</option>
          <option value="title">مرتب‌سازی: حروف الفبا</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '8px', position: 'relative' }}>
            <img src={item.cover} alt="" style={{ width: '100%', borderRadius: '4px', marginBottom: '10px' }} />
            <h4>{item.title}</h4>
            <p style={{ color: '#aaa', fontSize: '13px' }}>{item.artist || 'هنرمند سامانه'}</p>
            <span style={{ fontSize: '11px', color: '#1db954', backgroundColor: '#282828', padding: '2px 6px', borderRadius: '10px' }}>
              {item.itemType === 'song' ? 'تک آهنگ' : 'آلبوم'}
            </span>

            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
              {item.itemType === 'song' ? (
                <>
                  <button onClick={() => playSong(item, songs.filter(s => s.id !== item.id))} style={{ flex: 1, backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>پخش</button>
                  <button onClick={() => setActiveMenuSongId(activeMenuSongId === item.id ? null : item.id)} style={{ backgroundColor: '#333', border: 'none', color: '#fff', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </>
              ) : (
                <button style={{ flex: 1, backgroundColor: '#333', border: 'none', color: '#fff', padding: '5px', borderRadius: '4px' }}>مشاهده آلبوم</button>
              )}
            </div>

            {activeMenuSongId === item.id && (
              <div style={{ position: 'absolute', bottom: '45px', right: '10px', backgroundColor: '#282828', border: '1px solid #444', borderRadius: '4px', zIndex: 10, width: '160px' }}>
                <div style={{ padding: '5px', fontSize: '11px', color: '#888', borderBottom: '1px solid #444' }}>افزودن به پلی‌لیست:</div>
                {playlists.map(p => (
                  <div key={p.id} onClick={() => addSongToPlaylist(p.id, item)} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '13px' }}>
                    {p.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}