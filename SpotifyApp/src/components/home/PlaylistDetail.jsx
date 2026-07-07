// src/components/home/PlaylistDetail.jsx
import React, { useState } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { getSongs, getAlbums } from '../../utils/mockData';

export default function PlaylistDetail({ playlist, onBack }) {
  const { playSong } = usePlayback();
  
  const allSongs = getSongs();
  const allAlbums = getAlbums();

  const [songSearch, setSongSearch] = useState('');
  const [songResults, setSongResults] = useState([]);
  const [albumSearch, setAlbumSearch] = useState('');
  const [albumResults, setAlbumResults] = useState([]);

  const [currentItems, setCurrentItems] = useState(playlist?.songs || []);
  const [expandedAlbumIds, setExpandedAlbumIds] = useState({});

  const toggleAlbumExpand = (albumId) => {
    setExpandedAlbumIds(prev => ({ ...prev, [albumId]: !prev[albumId] }));
  };

  const handleSongSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!songSearch.trim()) { setSongResults([]); return; }
      const filtered = allSongs.filter(song => 
        song.title.toLowerCase().includes(songSearch.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(songSearch.toLowerCase()))
      );
      setSongResults(filtered);
    }
  };

  const handleAlbumSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!albumSearch.trim()) { setAlbumResults([]); return; }
      const filtered = allAlbums.filter(album => 
        album.title.toLowerCase().includes(albumSearch.toLowerCase()) ||
        (album.artist && album.artist.toLowerCase().includes(albumSearch.toLowerCase()))
      );
      setAlbumResults(filtered);
    }
  };

  const handleAddSong = (song) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    if (currentItems.some(item => item.id === song.id && item.itemType === 'song')) return;

    const songEntity = {
      ...song,
      itemType: 'song',
      albumId: song.albumId || null,
      albumTitle: song.albumTitle || null,
      plays: song.plays || 0,         
      listeners: song.listeners || [] 
    };

    const updatedItems = [...currentItems, songEntity];
    updateLocalStorage(allPlaylists, updatedItems);
  };

  const handleAddAlbum = (album) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    if (currentItems.some(item => item.id === album.id && item.itemType === 'album')) return;

    const albumTracks = allSongs.filter(s => s.albumId === album.id).map(track => ({
      ...track,
      itemType: 'song',
      albumId: album.id,
      albumTitle: album.title,
      plays: track.plays || 0,
      listeners: track.listeners || []
    }));

    const albumEntity = {
      ...album,
      itemType: 'album',
      plays: album.plays || 0,
      listeners: album.listeners || [],
      tracks: albumTracks.length > 0 ? albumTracks : [
        { id: `track_${album.id}_1`, title: `${album.title} - قطعه ۱`, artist: album.artist, cover: album.cover, albumId: album.id, itemType: 'song', plays: 0, listeners: [] },
        { id: `track_${album.id}_2`, title: `${album.title} - قطعه ۲`, artist: album.artist, cover: album.cover, albumId: album.id, itemType: 'song', plays: 0, listeners: [] }
      ]
    };

    const updatedItems = [...currentItems, albumEntity];
    updateLocalStorage(allPlaylists, updatedItems);
  };

  const updateLocalStorage = (allPlaylists, updatedItems) => {
    const updatedPlaylists = allPlaylists.map(p => {
      if (p.id === playlist.id) return { ...p, songs: updatedItems };
      return p;
    });
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setCurrentItems(updatedItems);
  };

  return (
    <div style={{ padding: '20px', color: '#fff', direction: 'rtl' }}>
      <button onClick={onBack} style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        ← بازگشت به پلی‌لیست‌ها
      </button>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
        <img src={playlist.cover} alt="" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954' }}>پلی‌لیست</span>
          <h2 style={{ fontSize: '32px', margin: '5px 0', fontWeight: '900' }}>{playlist.title}</h2>
          <p style={{ margin: 0, color: '#b3b3b3', fontSize: '13px' }}>توسط {playlist.owner}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* ستون راست (وسط صفحه) */}
        <div style={{ flex: 1, backgroundColor: '#121212', padding: '20px', borderRadius: '8px', minHeight: '400px' }}>
          <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '10px', marginBottom: '15px', textAlign: 'right' }}>محتوای لیست پخش</h3>
          
          {currentItems.length === 0 ? (
            /* نمای وضعیت خالی شبیه به بخش اعلانات */
            <div style={{ padding: '40px', textAlign: 'center', color: '#b3b3b3', backgroundColor: '#181818', borderRadius: '8px', border: '1px dashed #333', marginTop: '50px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>🔔 این پلی‌لیست در حال حاضر خالی است. از باکس‌های جستجوی سمت چپ آثاری را اضافه کنید.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentItems.map((item, index) => {
                if (item.itemType === 'song') {
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '4px', backgroundColor: '#181818' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: '#aaa', width: '20px' }}>{index + 1}</span>
                        <img src={item.cover} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                        <div style={{ textAlign: 'right' }}>
                          <h4 style={{ margin: 0, fontSize: '14px' }}>{item.title}</h4>
                          <p style={{ margin: 0, fontSize: '11px', color: '#b3b3b3' }}>{item.artist}</p>
                        </div>
                      </div>
                      <button onClick={() => playSong(item, currentItems.filter(s => s.itemType === 'song' && s.id !== item.id))} style={{ backgroundColor: 'transparent', border: '1px solid #1db954', color: '#1db954', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>پخش</button>
                    </div>
                  );
                }

                const isExpanded = !!expandedAlbumIds[item.id];
                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div onClick={() => toggleAlbumExpand(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '4px', backgroundColor: '#242424', cursor: 'pointer', borderRight: '4px solid #1db954' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: '#aaa', width: '20px' }}>{index + 1}</span>
                        <img src={item.cover} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                        <div style={{ textAlign: 'right' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', color: '#1db954' }}>🗂️ آلبوم: {item.title}</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{item.artist}</p>
                        </div>
                      </div>
                      <span style={{ color: '#1db954', fontSize: '12px' }}>{isExpanded ? '▲ بستن آلبوم' : '▼ باز کردن آلبوم'}</span>
                    </div>

                    {isExpanded && item.tracks && (
                      <div style={{ paddingRight: '30px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                        {item.tracks.map((track, tIndex) => (
                          <div key={track.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '4px', backgroundColor: '#1c1c1c', borderRight: '2px solid #555' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#666', fontSize: '11px' }}>{index + 1}.{tIndex + 1}</span>
                              <h5 style={{ margin: 0, fontSize: '13px', color: '#eee' }}>{track.title}</h5>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); playSong(track, item.tracks.filter(t => t.id !== track.id)); }} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '3px 10px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px' }}>▶ پخش</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ستون چپ (بخش جستجو) */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#b3b3b3', textAlign: 'right' }}>جستجو و افزودن تک آهنگ</h4>
            <input type="text" value={songSearch} onChange={(e) => setSongSearch(e.target.value)} onKeyDown={handleSongSearchKeyDown} placeholder="🔍 نام آهنگ... (Enter)" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#282828', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {songResults.map(song => (
                <div key={song.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px', backgroundColor: '#222', borderRadius: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#fff' }}>{song.title}</span>
                  <button onClick={() => handleAddSong(song)} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>＋</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#b3b3b3', textAlign: 'right' }}>جستجو و افزودن کل آلبوم</h4>
            <input type="text" value={albumSearch} onChange={(e) => setAlbumSearch(e.target.value)} onKeyDown={handleAlbumSearchKeyDown} placeholder="🔍 نام آلبوم... (Enter)" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#282828', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {albumResults.map(album => (
                <div key={album.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px', backgroundColor: '#222', borderRadius: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#fff' }}>{album.title}</span>
                  <button onClick={() => handleAddAlbum(album)} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>＋</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}