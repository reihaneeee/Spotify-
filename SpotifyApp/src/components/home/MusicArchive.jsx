// src/components/home/MusicArchive.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSongs, getAlbums } from '../../utils/mockData';
import { usePlayback } from '../../context/PlaybackContext';

export default function MusicArchive() {
  const { playSong } = usePlayback();
  const location = useLocation();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('plays');
  const [playlists, setPlaylists] = useState([]);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);
  
  // استیت‌های جدید مدیریت انیمیشن دوطرفه (سبز برای اد / قرمز برای حذف)
  const [animatingCardId, setAnimatingCardId] = useState(null);
  const [animationType, setAnimationType] = useState('add'); // 'add' or 'remove'

  const allSongs = getSongs();
  const allAlbums = getAlbums();

  useEffect(() => {
    setPlaylists(JSON.parse(localStorage.getItem('playlists') || '[]'));
  }, [activeMenuSongId]);

  let displayItems = [];
  
  if (location.pathname === '/singles') {
    displayItems = allSongs
      .filter(song => !song.albumId)
      .map(s => ({ ...s, itemType: 'song' }));
  } else if (location.pathname === '/albums') {
    displayItems = allAlbums.map(a => ({ 
      ...a, 
      itemType: 'album', 
      plays: a.trackCount ? a.trackCount * 100000 : 500000 
    }));
  } else {
    displayItems = [
      ...allSongs.map(s => ({ ...s, itemType: 'song' })),
      ...allAlbums.map(a => ({ ...a, itemType: 'album', plays: (a.trackCount || 5) * 100000 }))
    ];
  }

  const filteredItems = displayItems.filter(item => {
    return item.title.toLowerCase().includes(search.toLowerCase()) || 
           (item.artist && item.artist.toLowerCase().includes(search.toLowerCase()));
  }).sort((a, b) => {
    if (sortBy === 'plays') return b.plays - a.plays;
    return a.title.localeCompare(b.title);
  });

  // 🔴 تابع هوشمند دوطرفه: مدیریت خودکار افزودن یا حذف اثر از پلی‌لیست
  const toggleTrackInPlaylist = (playlistId, item, isAlreadyAdded) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    
    const updated = allPlaylists.map(p => {
      if (p.id === playlistId) {
        const currentSongs = p.songs || [];
        
        if (isAlreadyAdded) {
          // سناریو حذف: اثر از پلی‌لیست فیلتر و حذف می‌شود
          return { ...p, songs: currentSongs.filter(s => s.id !== item.id) };
        } else {
          // سناریو افزودن: اثر به پلی‌لیست الحاق می‌شود
          return { ...p, songs: [...currentSongs, { ...item, itemType: item.itemType }] };
        }
      }
      return p;
    });
    
    localStorage.setItem('playlists', JSON.stringify(updated));
    setActiveMenuSongId(null);
    setPlaylists(updated); // به‌روزرسانی زنده وضعیت منو
    
    // 🟢 راه‌اندازی جلوه انیمیشنی متناسب با اکشن کاربر
    setAnimationType(isAlreadyAdded ? 'remove' : 'add');
    setAnimatingCardId(item.id);
    
    setTimeout(() => {
      setAnimatingCardId(null);
    }, 800);
  };

  return (
    <div style={{ padding: '20px', color: '#fff', direction: 'rtl' }}>
      <h3>
        {location.pathname === '/singles' && '🎵 تک آهنگ‌های مستقل سامانه'}
        {location.pathname === '/albums' && '🗂️ آلبوم‌های منتشر شده'}
        {!['/singles', '/albums'].includes(location.pathname) && 'آرشیو و جستجوی موسیقی سامانه'}
      </h3>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="جستجو بر اساس نام اثر یا هنرمند..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', backgroundColor: '#181818', color: '#fff', border: '1px solid #444', flex: 1, textAlign: 'right' }}
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          style={{ padding: '10px', backgroundColor: '#181818', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
        >
          <option value="plays">مرتب‌سازی: تعداد شنونده</option>
          <option value="title">مرتب‌سازی: حروف الفبا</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
        {filteredItems.map(item => {
          const isAnimating = animatingCardId === item.id;
          // تعیین رنگ انیمیشن بر اساس نوع اکشن (افزودن: سبز / حذف: قرمز)
          const targetBgColor = animationType === 'add' ? '#144c27' : '#5c1515';
          const targetBorderColor = animationType === 'add' ? '#1db954' : '#e91429';
          
          return (
            <div 
              key={item.id} 
              style={{ 
                padding: '15px', 
                borderRadius: '8px', 
                position: 'relative',
                backgroundColor: isAnimating ? targetBgColor : '#181818', 
                border: isAnimating ? `1px solid ${targetBorderColor}` : '1px solid transparent',
                transition: 'background-color 0.2s ease, border 0.2s ease'
              }}
            >
              <img src={item.cover} alt="" style={{ width: '100%', borderRadius: '4px', marginBottom: '10px' }} />
              <h4 style={{ margin: '5px 0', textAlign: 'right' }}>{item.title}</h4>
              <p style={{ color: '#aaa', fontSize: '12px', margin: '5px 0', textAlign: 'right' }}>{item.artist || 'هنرمند سامانه'}</p>
              
              <span style={{ fontSize: '11px', color: '#1db954', backgroundColor: '#282828', padding: '2px 6px', borderRadius: '10px', display: 'inline-block', float: 'right' }}>
                {item.itemType === 'song' ? 'تک آهنگ' : 'آلبوم'}
              </span>

              <div style={{ clear: 'both', display: 'flex', gap: '5px', marginTop: '12px' }}>
                {item.itemType === 'song' ? (
                  <>
                    <button onClick={() => playSong(item, displayItems.filter(s => s.itemType === 'song' && s.id !== item.id))} style={{ flex: 1, backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>پخش</button>
                    <button onClick={() => setActiveMenuSongId(activeMenuSongId === item.id ? null : item.id)} style={{ backgroundColor: '#333', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                  </>
                ) : (
                  <>
                    <button style={{ flex: 1, backgroundColor: '#333', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>مشاهده آلبوم</button>
                    <button onClick={() => setActiveMenuSongId(activeMenuSongId === item.id ? null : item.id)} style={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                  </>
                )}
              </div>

              {/* منوی هوشمند پاپ‌آپ دوطرفه */}
              {activeMenuSongId === item.id && (
                <div style={{ position: 'absolute', bottom: '50px', right: '10px', backgroundColor: '#282828', border: '1px solid #444', borderRadius: '4px', zIndex: 10, width: '170px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '6px', fontSize: '11px', color: '#888', borderBottom: '1px solid #444', textAlign: 'right' }}>مدیریت در پلی‌لیست‌ها:</div>
                  {playlists.map(p => {
                    // 🔴 بررسی اینکه آیا این آهنگ/آلبوم در حال حاضر در این پلی‌لیست هست یا خیر
                    const isAdded = (p.songs || []).some(s => s.id === item.id);
                    
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => toggleTrackInPlaylist(p.id, item, isAdded)} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', cursor: 'pointer', fontSize: '13px', textAlign: 'right', color: '#fff', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#383838'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                        {/* 🔴 رندر داینامیک علامت مثبت سبز یا منفی قرمز متناسب با وجود اثر */}
                        {isAdded ? (
                          <span style={{ color: '#e91429', fontWeight: 'bold', fontSize: '14px' }} title="حذف از لیست">➖</span>
                        ) : (
                          <span style={{ color: '#1db954', fontWeight: 'bold', fontSize: '14px' }} title="افزودن به لیست">➕</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}