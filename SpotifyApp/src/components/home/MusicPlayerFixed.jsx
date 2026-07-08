// src/components/home/MusicPlayerFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { Music, ListMusic, Minimize2, X } from 'lucide-react';

export default function MusicPlayerFixed({ currentUser }) {
  const { 
    currentSong, isPlaying, setIsPlaying, 
    shuffle, setShuffle, 
    repeatMode, setRepeatMode, 
    playNext, playPrevious, queue 
  } = usePlayback();

  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  
  const audioRef = useRef(null);
  const isGold = currentUser?.subscription === 'gold';
  const audioSource = currentSong?.audioData || currentSong?.audioUrl || currentSong?.src || null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentSong || !audioSource) return;
    try {
      audioRef.current.load();
      setIsPlaying(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    } catch (err) {
      setIsPlaying(false);
    }
    setProgress(0);
  }, [currentSong, audioSource]);

  useEffect(() => {
    if (!audioRef.current || !audioSource) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioSource]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
  };

  const handleProgressChange = (e) => {
    const val = e.target.value;
    setProgress(val);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  if (!currentSong) return null;

  const formatTimeLabel = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSeconds = audioRef.current ? audioRef.current.currentTime : 0;
  const totalDurationSeconds = audioRef.current && !isNaN(audioRef.current.duration) ? audioRef.current.duration : (currentSong.duration || 198);

  const handleNavigateToAlbum = () => {
    if (currentSong.albumTitle || currentSong.albumId) {
      window.dispatchEvent(new CustomEvent('globalSelectAlbum', { 
        detail: { id: currentSong.albumId, title: currentSong.albumTitle, artist: currentSong.artist } 
      }));
    }
  };

  // 🛠️ مورد ۲: تابع کلیک جهت هدایت کاربر به پروفایل هنرمند اثر از درون نوار پخش
  const handleNavigateToArtist = () => {
    const storedArtists = JSON.parse(localStorage.getItem('artists') || '[]');
    const foundArtist = storedArtists.find(a => a.id === currentSong.artistId || a.name === currentSong.artist);
    
    if (foundArtist) {
      localStorage.setItem('selected_artist_view', JSON.stringify(foundArtist));
    } else {
      localStorage.setItem('selected_artist_view', JSON.stringify({ id: currentSong.artistId || currentSong.artist, name: currentSong.artist, bio: 'Verified Spotify Artist' }));
    }
    // ارسال سیگنال هدایت به صفحه پروفایل هنرمند
    window.location.href = '/profile';
  };

  const renderPlaybackControls = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : '40%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
        <button onClick={() => setShuffle(!shuffle)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px' }}>
          <span>🔀</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: shuffle ? '#1db954' : '#fff' }}>{shuffle ? 'Random' : 'no shuffle'}</span>
        </button>
        <button onClick={playPrevious} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>⏮</button>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '38px', height: '35px', borderRadius: '50%', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{isPlaying ? '⏸' : '▶'}</button>
        <button onClick={playNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>⏭</button>
        <button onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')} style={{ background: 'none', border: 'none', color: repeatMode !== 'none' ? '#1db954' : '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🔁</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
            {repeatMode === 'none' && 'no repeat'}
            {repeatMode === 'one' && 'Repeat: 1'}
            {repeatMode === 'all' && 'Repeat: All'}
          </span>
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        <span style={{ fontSize: '11px', color: '#a7a7a7' }}>{formatTimeLabel(currentSeconds)}</span>
        <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange} disabled={!audioSource} style={{ flex: 1, accentColor: '#1db954', cursor: audioSource ? 'pointer' : 'not-allowed', height: '4px' }} />
        <span style={{ fontSize: '11px', color: '#a7a7a7' }}>{formatTimeLabel(totalDurationSeconds)}</span>
      </div>
    </div>
  );

  return (
    <>
      {audioSource && <audio ref={audioRef} src={audioSource} onTimeUpdate={handleTimeUpdate} onEnded={playNext} />}

      {showLyrics && (
        <div style={{ position: 'fixed', bottom: '110px', left: '24px', width: '300px', backgroundColor: '#282828', borderRadius: '8px', border: '1px solid #3e3e3e', padding: '16px', zIndex: 1100, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #3e3e3e', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1db954' }}>📝 Lyrics Window</span>
            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowLyrics(false)} />
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#fff', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto', lineHeight: '1.6' }}>
            {currentSong.lyrics ? currentSong.lyrics : "This song has no lyrics available."}
          </p>
        </div>
      )}

      {showQueue && (
        <div style={{ position: 'fixed', bottom: '110px', right: '24px', width: '300px', backgroundColor: '#282828', borderRadius: '8px', border: '1px solid #3e3e3e', padding: '16px', zIndex: 1100, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #3e3e3e', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1db954' }}>🔀 Playback Queue ({queue.length})</span>
            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowQueue(false)} />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {queue.map((qSong, qIdx) => (
              <div key={qIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', borderRadius: '4px', backgroundColor: qSong.id === currentSong.id ? 'rgba(29,185,84,0.15)' : 'transparent' }}>
                <span style={{ fontSize: '11px', color: '#a7a7a7', width: '15px' }}>{qIdx + 1}</span>
                <div style={{ overflow: 'hidden' }}>
                  <h6 style={{ margin: 0, fontSize: '12px', color: qSong.id === currentSong.id ? '#1db954' : '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qSong.title}</h6>
                  <span style={{ fontSize: '10px', color: '#b3b3b3' }}>{qSong.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isMobile ? (
        <div 
          onClick={() => setIsMobileFullscreen(true)}
          style={{ position: 'fixed', bottom: '10px', left: '10px', right: '10px', height: '64px', backgroundColor: '#282828', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 1000, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <img src={currentSong.cover || 'https://picsum.photos/50'} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <h5 style={{ margin: 0, fontSize: '13px', color: '#fff', whiteSpace: 'nowrap' }}>{currentSong.title}</h5>
              <span style={{ fontSize: '11px', color: '#b3b3b3', whiteSpace: 'nowrap' }}>{currentSong.artist}</span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#fff', color: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      ) : (
        /* دسکتاپ */
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '105px', backgroundColor: '#181818', borderTop: '1px solid #282828', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', color: '#fff', zIndex: 1000, direction: 'ltr' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%', textAlign: 'left' }}>
            <img src={currentSong.cover || 'https://picsum.photos/56'} alt="" style={{ width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentSong.title}</h4>
              
              {/* 🛠️ مورد ۲: نام خواننده در نوار پخش زیر کادر اصلی کاملاً کلیک‌پذیر و لینک شده است */}
              <p 
                onClick={handleNavigateToArtist}
                style={{ margin: 0, fontSize: '12px', color: '#b3b3b3', whiteSpace: 'nowrap', cursor: 'pointer', display: 'inline-block', width: 'fit-content' }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration='underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration='none'}
              >
                {currentSong.artist}
              </p>
              
              {/* 🛠️ فیکس باگ ۲: چیدمان افقی و منعطف فیلد آلبوم و آمار چشم گولد بدون به‌هم‌ریختگی ارتفاع پلیر */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                {(currentSong.albumTitle || currentSong.albumId) && (
                  <span onClick={handleNavigateToAlbum} style={{ fontSize: '11px', color: '#1db954', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }} onMouseOver={(e) => e.currentTarget.style.textDecoration='underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration='none'}>
                    💿 {currentSong.albumTitle}
                  </span>
                )}

                {isGold && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#1db954', backgroundColor: 'rgba(29,185,84,0.1)', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    <span>👁️ {currentSong.plays || 0} plays</span> • <span>{(currentSong.uniqueUsers || []).length} listeners</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {renderPlaybackControls()}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', width: '30%' }}>
            <button onClick={() => setShowLyrics(!showLyrics)} style={{ backgroundColor: showLyrics ? '#1db954' : 'transparent', border: '1px solid #555', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>📝 Lyrics</button>
            <button onClick={() => setShowQueue(!showQueue)} style={{ backgroundColor: showQueue ? '#1db954' : 'transparent', border: '1px solid #555', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><ListMusic size={14}/> Queue</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔊</span> <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '80px', accentColor: '#1db954' }} />
            </div>
          </div>
        </div>
      )}

      {isMobile && isMobileFullscreen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212', zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box', justifyContent: 'space-between', direction: 'ltr' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '1px' }}>Playing From Archive</span>
            <button onClick={() => setIsMobileFullscreen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><Minimize2 size={22} /></button>
          </div>

          <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.6)' }}>
            <img src={currentSong.cover || 'https://picsum.photos/300'} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ textAlign: 'left', marginTop: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleNavigateToArtist}>{currentSong.title}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#b3b3b3', cursor: 'pointer' }} onClick={handleNavigateToArtist}>{currentSong.artist}</p>
            {currentSong.albumTitle && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1db954', cursor: 'pointer' }} onClick={handleNavigateToAlbum}>💿 {currentSong.albumTitle}</p>}
            
            {isGold && (
              <div style={{ fontSize: '12px', color: '#1db954', marginTop: '6px' }}>
                <span>👁️ {currentSong.plays || 0} plays</span> • <span>{(currentSong.uniqueUsers || []).length} listeners</span>
              </div>
            )}
          </div>

          {renderPlaybackControls()}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <button onClick={(e) => { e.stopPropagation(); setShowLyrics(!showLyrics); }} style={{ backgroundColor: '#282828', border: '1px solid #444', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>📝 Lyrics</button>
            <button onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); }} style={{ backgroundColor: '#282828', border: '1px solid #444', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>🗂️ Queue</button>
          </div>
        </div>
      )}
    </>
  );
}