// src/pages/ArtistDashboard/WaveformPlayer.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import styles from '../../styles/WaveformPlayer.module.css';
import { PlayIcon, PauseIcon } from '../icons';

const BAR_COUNT = 70; 

const WaveformPlayer = ({ src, fileName }) => {
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverRatio, setHoverRatio] = useState(null); 
  const [isDragging, setIsDragging] = useState(false); 

  const bars = useMemo(() => {
    const key = src || fileName || 'default';
    let seed = 0;
    for (let i = 0; i < key.length; i++) seed += key.charCodeAt(i);
    return Array.from({ length: BAR_COUNT }, () => {
      seed = (seed * 9301 + 49297) % 233280;
      return 0.15 + (seed / 233280) * 0.85; 
    });
  }, [src, fileName]);

  const progress = duration ? currentTime / duration : 0;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const calculateSeekRatio = (e) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio)); 
    return ratio;
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateAudioTime(calculateSeekRatio(e));
  };

  const handlePointerMove = (e) => {
    const ratio = calculateSeekRatio(e);
    setHoverRatio(ratio);
    if (isDragging) {
      updateAudioTime(ratio);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerLeave = () => {
    setHoverRatio(null);
    setIsDragging(false);
  };

  const updateAudioTime = (ratio) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = ratio * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s) || s === Infinity) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    const audio = audioRef.current;
    if (audio && src) {
      audio.load();
      const timeout = setTimeout(() => {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [src]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isDragging]);

  return (
    <div className={styles.waveformContainer}>
      <button type="button" className={styles.playBtn} onClick={togglePlay}>
        {isPlaying ? <PauseIcon size={24} color="#000" /> : <PlayIcon size={24} color="#000" />}
      </button>

      <div className={styles.waveMain}>
        <div 
          className={styles.waveBarsArea} 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {bars.map((height, i) => {
            const barRatio = i / BAR_COUNT;
            let barClass = styles.barUnplayed;
            
            if (barRatio <= progress) {
              barClass = styles.barPlayed; 
            } else if (hoverRatio !== null && barRatio <= hoverRatio) {
              barClass = styles.barHover; 
            }

            return (
              <div
                key={i}
                className={`${styles.waveBar} ${barClass}`}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>

        <div className={styles.timeInfo}>
          <span>{formatTime(currentTime)}</span>
          <span className={styles.trackName} title={fileName}>{fileName || 'Unknown Audio'}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src || ''}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default WaveformPlayer;