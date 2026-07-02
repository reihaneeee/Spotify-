// src/components/home/MusicPlayerFixed.jsx
import React, { useState } from 'react';
import { usePlayback } from '../../context/PlaybackContext';

export default function MusicPlayerFixed({ currentUser }) {
  const { currentSong, isPlaying, setIsPlaying } = usePlayback();
  const [progress, setProgress] = useState(25);
  const [volume, setVolume] = useState(70);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, all, one
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) return null;

  const isGold = currentUser?.subscription === 'gold';

  const handleRepeatToggle = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '95px',
      backgroundColor: '#181818', borderTop: '1px solid #282828',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 24px', color: '#fff', zIndex: 1000
    }}>
      {/* بخش راست: کاور و اطلاعات اثر */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%' }}>
        <img src={currentSong.cover} alt="" style={{ width: '56px', height: '56px', borderRadius: '4px' }} />
        <div>
          <h4 style={{ margin: 0, fontSize: '14px' }}>{currentSong.title}</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#b3b3b3' }}>{currentSong.artist}</p>
          {isGold && (
            <span style={{ fontSize: '11px', color: '#1db954', display: 'block', marginTop: '2px' }}>
              👁 {(currentSong.plays / 1000000).toFixed(2)}M شنونده (ویژه طلایی)
            </span>
          )}
        </div>
      </div>

      {/* بخش وسط: کلیدهای ناوبری و پروگرس بار */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <button onClick={() => setShuffle(!shuffle)} style={{ background: 'none', border: 'none', color: shuffle ? '#1db954' : '#fff', cursor: 'pointer', fontSize: '16px' }}>🔀</button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>⏮</button>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>⏭</button>
          <button onClick={handleRepeatToggle} style={{ background: 'none', border: 'none', color: repeatMode !== 'none' ? '#1db954' : '#fff', cursor: 'pointer', fontSize: '16px' }}>
            🔁 {repeatMode === 'one' && <span style={{ fontSize: '10px', verticalAlign: 'super' }}>1</span>}
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: '#a7a7a7' }}>0:45</span>
          <input 
            type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)}
            style={{ flex: 1, accentColor: '#1db954', cursor: 'pointer', height: '4px' }}
          />
          <span style={{ fontSize: '11px', color: '#a7a7a7' }}>3:18</span>
        </div>
      </div>

      {/* بخش چپ: متن ترانه و کنترل صدا */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'flex-end', width: '30%' }}>
        <button onClick={() => setShowLyrics(!showLyrics)} style={{ backgroundColor: showLyrics ? '#1db954' : 'transparent', border: '1px solid #555', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>
          📝 متن آهنگ
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🔊</span>
          <input 
            type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)}
            style={{ width: '85px', accentColor: '#1db954', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* باکس پاپ‌آپ نمایش متن ترانه */}
      {showLyrics && (
        <div style={{ position: 'fixed', bottom: '110px', left: '24px', backgroundColor: '#282828', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', maxWidth: '280px', border: '1px solid #333' }}>
          <h5 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px' }}>متن قطعه (Lyrics)</h5>
          <p style={{ fontSize: '13px', color: '#b3b3b3', lineHeight: '1.6', margin: 0 }}>
            این یک متن پیش‌فرض برای شبیه‌سازی لیریکس قطعه در فاز اول پروژه برنامه‌سازی وب است.
          </p>
        </div>
      )}
    </div>
  );
}