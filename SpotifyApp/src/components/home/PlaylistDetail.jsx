// src/components/home/PlaylistDetail.jsx
import React, { useState } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { getSongs, getAlbums } from '../../utils/mockData';

export default function PlaylistDetail({ playlist, onBack }) {
  const { playSong } = usePlayback();
  
  // خواندن کل دیتای موجود در سیستم برای سرچ کردن
  const allSongs = getSongs();
  const allAlbums = getAlbums();

  // استیت‌های مربوط به بخش آهنگ
  const [songSearch, setSongSearch] = useState('');
  const [songResults, setSongResults] = useState([]);

  // استیت‌های مربوط به بخش آلبوم
  const [albumSearch, setAlbumSearch] = useState('');
  const [albumResults, setAlbumResults] = useState([]);

  // استیت محلی برای به‌روزرسانی آنی آهنگ‌های پلی‌لیست روی صفحه
  const [currentPlaylistSongs, setCurrentPlaylistSongs] = useState(playlist?.songs || []);

  // هندلر سرچ آهنگ با زدن دکمه اینتر
  const handleSongSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!songSearch.trim()) {
        setSongResults([]);
        return;
      }
      const filtered = allSongs.filter(song => 
        song.title.toLowerCase().includes(songSearch.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(songSearch.toLowerCase()))
      );
      setSongResults(filtered);
    }
  };

  // هندلر سرچ آلبوم با زدن دکمه اینتر
  const handleAlbumSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!albumSearch.trim()) {
        setAlbumResults([]);
        return;
      }
      const filtered = allAlbums.filter(album => 
        album.title.toLowerCase().includes(albumSearch.toLowerCase()) ||
        (album.artist && album.artist.toLowerCase().includes(albumSearch.toLowerCase()))
      );
      setAlbumResults(filtered);
    }
  };

  // افزودن تک آهنگ به پلی‌لیست
  const handleAddSong = (song) => {
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    
    // جلوگیری از اضافه کردن آهنگ تکراری
    if (currentPlaylistSongs.some(s => s.id === song.id)) {
      alert('این آهنگ از قبل در پلی‌لیست موجود است.');
      return;
    }

    const updatedSongs = [...currentPlaylistSongs, song];
    
    // ذخیره در لوکال استوریج کل سیستم
    const updatedPlaylists = allPlaylists.map(p => {
      if (p.id === playlist.id) {
        return { ...p, songs: updatedSongs };
      }
      return p;
    });

    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setCurrentPlaylistSongs(updatedSongs); // آپدیت آنی وسط صفحه
    alert(`آهنگ "${song.title}" به پلی‌لیست اضافه شد.`);
  };

  // افزودن تمام آهنگ‌های یک آلبوم به پلی‌لیست
  const handleAddAlbumSongs = (album) => {
    // در دیتای ماک، آهنگ‌های آلبوم معمولاً شبیه‌سازی شده‌اند یا باید مستقیماً اضافه شوند
    // برای سادگی، یک شیء آهنگ فرضی از روی آلبوم می‌سازیم یا اگر آلبوم لیستی از آهنگ‌ها دارد اضافه می‌کنیم
    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    
    // شبیه‌سازی یک قطعه به نام آلبوم برای فاز فرانت‌آند
    const simulatedAlbumSong = {
      id: `album_track_${album.id}_${Date.now()}`,
      title: `مجموعه آثار: ${album.title}`,
      artist: album.artist || 'هنرمند سامانه',
      cover: album.cover,
      plays: album.plays || 100000
    };

    const updatedSongs = [...currentPlaylistSongs, simulatedAlbumSong];

    const updatedPlaylists = allPlaylists.map(p => {
      if (p.id === playlist.id) {
        return { ...p, songs: updatedSongs };
      }
      return p;
    });

    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setCurrentPlaylistSongs(updatedSongs);
    alert(`آلبوم "${album.title}" به وسط صفحه اضافه شد.`);
  };

  return (
    <div style={{ padding: '20px', color: '#fff', direction: 'rtl' }}>
      
      {/* دکمه بازگشت */}
      <button 
        onClick={onBack}
        style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ← بازگشت به پلی‌لیست‌ها
      </button>

      {/* هدر اطلاعات پلی‌لیست */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
        <img src={playlist.cover} alt="" style={{ width: '120px', height: '120px', borderRadius: '8px', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }} />
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954' }}>پلی‌لیست انتخاب شده</span>
          <h2 style={{ fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{playlist.title}</h2>
          <p style={{ margin: 0, color: '#b3b3b3', fontSize: '14px' }}>
            توسط <strong>{playlist.owner}</strong> • {currentPlaylistSongs.length} اثر موجود
          </p>
        </div>
      </div>

      {/* بدنه اصلی دو ستونه */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* === ستون راست (وسط صفحه): آثار موجود در پلی‌لیست === */}
        <div style={{ flex: 1, backgroundColor: '#121212', padding: '20px', borderRadius: '8px', minHeight: '400px' }}>
          <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '10px', marginBottom: '15px', textAlign: 'right' }}>آثار موجود در این لیست</h3>
          
          {currentPlaylistSongs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#555', padding: '8px0 0', marginTop: '100px' }}>
              هنوز هیچ اثری اضافه نشده است. از باکس‌های جستجوی سمت چپ قطعات را اضافه کنید.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentPlaylistSongs.map((song, index) => (
                <div 
                  key={song.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '4px', backgroundColor: '#181818' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: '#aaa', width: '20px' }}>{index + 1}</span>
                    <img src={song.cover} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ margin: 0, fontSize: '14px' }}>{song.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{song.artist || 'هنرمند سامانه'}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => playSong(song, currentPlaylistSongs.filter(s => s.id !== song.id))}
                    style={{ backgroundColor: 'transparent', border: '1px solid #1db954', color: '#1db954', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    پخش قطعه
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === ستون چپ: بخش جستجو و افزودن سریع === */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* باکس جستجوی آهنگ */}
          <div style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#b3b3b3', textAlign: 'right' }}>جستجو و افزودن قطعه</h4>
            <input 
              type="text"
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              onKeyDown={handleSongSearchKeyDown}
              placeholder="🔍 افزودن آهنگ... (اینتر بزنید)"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#282828', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />
            
            {/* نتایج سرچ آهنگ */}
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '180px', overflowY: 'auto' }}>
              {songResults.map(song => (
                <div key={song.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px', backgroundColor: '#222', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={song.cover} alt="" style={{ width: '30px', height: '30px', borderRadius: '20px' }} />
                    <span style={{ fontSize: '12px', color: '#fff', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</span>
                  </div>
                  <button 
                    onClick={() => handleAddSong(song)}
                    style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                    title="افزودن به لیست"
                  >
                    ＋
                  </button>
                </div>
              ))}
              {songSearch && songResults.length === 0 && (
                <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '5px' }}>نتیجه‌ای یافت نشد.</div>
              )}
            </div>
          </div>

          {/* باکس جستجوی آلبوم */}
          <div style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#b3b3b3', textAlign: 'right' }}>جستجو و افزودن آلبوم</h4>
            <input 
              type="text"
              value={albumSearch}
              onChange={(e) => setAlbumSearch(e.target.value)}
              onKeyDown={handleAlbumSearchKeyDown}
              placeholder="🔍 افزودن آلبوم... (اینتر بزنید)"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#282828', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
            />

            {/* نتایج سرچ آلبوم */}
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '180px', overflowY: 'auto' }}>
              {albumResults.map(album => (
                <div key={album.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px', backgroundColor: '#222', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={album.cover} alt="" style={{ width: '30px', height: '30px', borderRadius: '20px' }} />
                    <span style={{ fontSize: '12px', color: '#fff', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.title}</span>
                  </div>
                  <button 
                    onClick={() => handleAddAlbumSongs(album)}
                    style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                    title="افزودن آلبوم"
                  >
                    ＋
                  </button>
                </div>
              ))}
              {albumSearch && albumResults.length === 0 && (
                <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '5px' }}>نتیجه‌ای یافت نشد.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}