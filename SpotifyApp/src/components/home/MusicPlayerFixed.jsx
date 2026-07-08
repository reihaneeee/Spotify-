// src/components/home/MusicPlayerFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { Music } from 'lucide-react';

export default function MusicPlayerFixed({ currentUser }) {
  const { 
    currentSong, isPlaying, setIsPlaying, 
    shuffle, setShuffle, 
    repeatMode, setRepeatMode, 
    playNext, playPrevious 
  } = usePlayback();

  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const audioRef = useRef(null);

  // 🛠️ فیکس نهایی سورس صوتی: اگر ترک واقعی آپلود کردی (audioData یا audioUrl)، آن را بردارد، وگرنه src
  const audioSource = currentSong?.audioData || currentSong?.audioUrl || currentSong?.src || null;

  useEffect(() => {
    if (!audioRef.current || !currentSong || !audioSource) return;

    try {
      audioRef.current.load();
      setIsPlaying(true);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Playback interaction prevented:", error);
          setIsPlaying(false);
        });
      }
    } catch (err) {
      console.error("Audio playback error:", err);
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

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '95px',
      backgroundColor: '#181818', borderTop: '1px solid #282828',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 24px', color: '#fff', zIndex: 1000, direction: 'ltr'
    }}>
      {/* جلوگیری از ارور شبکه با رندر شرطی و مقدار امن نال */}
      {audioSource ? (
        <audio 
          ref={audioRef}
          src={audioSource}
          onTimeUpdate={handleTimeUpdate}
          onEnded={playNext}
        />
      ) : null}

      {/* بخش راست: اطلاعات قطعه */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%', textAlign: 'left' }}>
        {currentSong.cover ? (
          <img src={currentSong.cover} alt="" style={{ width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '56px', height: '56px', borderRadius: '4px', backgroundColor: '#282828', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Music size={24} style={{ color: '#535353' }} />
          </div>
        )}
        <div>
          <h4 style={{ margin: 0, fontSize: '14px' }}>{currentSong.title}</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#b3b3b3' }}>{currentSong.artist}</p>
        </div>
      </div>

      {/* بخش وسط: کنترلرها با نوشته شافل مد نظرت */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <button 
            onClick={() => setShuffle(!shuffle)} 
            style={{ 
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px' 
            }}
          >
            <span>🔀</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: shuffle ? '#1db954' : '#fff' }}>
              {shuffle ? 'Random' : 'no shuffle'}
            </span>
          </button>
          
          <button onClick={playPrevious} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>⏮</button>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{isPlaying ? '⏸' : '▶'}</button>
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

      {/* بخش چپ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'flex-end', width: '30%' }}>
        <button onClick={() => setShowLyrics(!showLyrics)} style={{ backgroundColor: showLyrics ? '#1db954' : 'transparent', border: '1px solid #555', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>📝 Lyrics</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔊</span> <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '85px', accentColor: '#1db954' }} />
        </div>
      </div>
    </div>
  );
}