import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Sliders, Music, Shuffle, Repeat, Repeat1, FileText, X
} from 'lucide-react';
import { extractDominantColor } from '../../utils/colorExtractor';
import { usePlayback } from '../../context/PlaybackContext';
import { useAuth } from '../../context/AuthContext';

const BACKEND_BASE = 'http://127.0.0.1:8000';

const getFullMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (cleanUrl.startsWith('/api/media/')) {
      cleanUrl = cleanUrl.replace('/api/media/', '/media/');
    } else if (cleanUrl.startsWith('/api/')) {
      cleanUrl = cleanUrl.replace('/api/', '/');
    }
    if (!cleanUrl.startsWith('/media/') && !cleanUrl.startsWith('/static/')) {
      cleanUrl = `/media${cleanUrl}`;
    }
    fullUrl = `${BACKEND_BASE}${cleanUrl}`;
  }

  if (fullUrl.includes('/api/') || fullUrl.includes('stream')) {
    const tokenObj = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('user');
    let tokenStr = tokenObj;
    try {
      if (tokenObj && tokenObj.startsWith('{')) {
        const parsed = JSON.parse(tokenObj);
        tokenStr = parsed.access || parsed.token || parsed.access_token || tokenObj;
      }
    } catch(e) {}
    
    if (tokenStr && !fullUrl.includes('token=')) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}token=${tokenStr}`;
    }
  }
  
  return fullUrl;
};

const DEFAULT_COVER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='%23282828'%3E%3Crect width='100%25' height='100%25' fill='%23282828'/%3E%3C/svg%3E";

export default function MusicPlayerFixed() {
  const navigate = useNavigate();
  const { 
    currentSong, isPlaying, setIsPlaying, playNext, playPrevious,
    shuffle, setShuffle, repeatMode, setRepeatMode 
  } = usePlayback();
  const { user, updateUser } = useAuth();

  const audioRef = useRef(null);
  const outgoingAudioRef = useRef(null);
  const crossfadeTimerRef = useRef(null);
  const hasCrossfadedRef = useRef(false);
  const prevSongRef = useRef(null);
  const isSeekingRef = useRef(false);

  const audioCtxRef = useRef(null);
  const lowpassRef = useRef(null);
  const highpassRef = useRef(null);
  const peakingRef = useRef(null);
  const isAudioCtxSetupRef = useRef(false);

  if (!audioRef.current && typeof window !== 'undefined') {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous'; 
    audioRef.current = audio;
  }

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('player_volume');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [audioQuality, setAudioQuality] = useState(() => localStorage.getItem('player_quality') || 'high');
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(() => localStorage.getItem('player_crossfade') === 'true');
  const [dominantColor, setDominantColor] = useState('#1db954');
  const [showLyrics, setShowLyrics] = useState(false);

  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const activeSong = currentSong?.song || currentSong?.track || currentSong;
  const hasSong = Boolean(activeSong && (activeSong.title || activeSong.audio_file || activeSong.src || activeSong.file || activeSong.audioUrl));

  const clearCrossfadeTimer = () => {
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
  };

  const stopCrossfadeImmediately = () => {
    clearCrossfadeTimer();
    if (outgoingAudioRef.current) {
      outgoingAudioRef.current.pause();
      outgoingAudioRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
    }
  };

  useEffect(() => {
    if (user) {
      if (user.volume !== undefined && user.volume !== null) {
        setVolume(user.volume);
        if (audioRef.current) audioRef.current.volume = user.volume;
      }
      if (user.audio_quality) {
        setAudioQuality(user.audio_quality);
      }
      if (user.crossfade_enabled !== undefined && user.crossfade_enabled !== null) {
        setCrossfadeEnabled(user.crossfade_enabled);
      }
      if (user.repeat_mode) {
        setRepeatMode(user.repeat_mode);
      }
      if (user.shuffle !== undefined && user.shuffle !== null) {
        setShuffle(user.shuffle);
      }
    }
  }, [user, setRepeatMode, setShuffle]);

  const initAudioPipeline = () => {
    if (isAudioCtxSetupRef.current || !audioRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      const peaking = ctx.createBiquadFilter();
      peaking.type = 'peaking';
      peaking.frequency.value = 1500;
      peaking.Q.value = 2.0;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(peaking);
      peaking.connect(ctx.destination);

      audioCtxRef.current = ctx;
      lowpassRef.current = lowpass;
      highpassRef.current = highpass;
      peakingRef.current = peaking;
      isAudioCtxSetupRef.current = true;

      applyQualityFilters(audioQuality);
    } catch (e) {
      console.warn("خطای Web Audio API:", e);
    }
  };

  const applyQualityFilters = (quality) => {
    if (!audioCtxRef.current || !lowpassRef.current) return;
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (quality === 'low') {
      lowpassRef.current.frequency.value = 800;   
      highpassRef.current.frequency.value = 600;  
      peakingRef.current.gain.value = 25;         
    } else {
      lowpassRef.current.frequency.value = 24000;
      highpassRef.current.frequency.value = 0;
      peakingRef.current.gain.value = 0;
    }
  };

  const handleQualityChange = (e) => {
    const newQuality = e.target.value;
    setAudioQuality(newQuality);
    localStorage.setItem('player_quality', newQuality);
    initAudioPipeline();
    applyQualityFilters(newQuality);
    if (user) updateUser({ audio_quality: newQuality });
  };

  const toggleCrossfade = () => {
    const newVal = !crossfadeEnabled;
    setCrossfadeEnabled(newVal);
    localStorage.setItem('player_crossfade', newVal.toString());
    if (user) updateUser({ crossfade_enabled: newVal });
  };

  useEffect(() => {
    if (!hasSong) {
      setDominantColor('#1db954');
      return;
    }
    const coverUrl = activeSong?.cover || activeSong?.cover_image || activeSong?.coverPreview;
    if (coverUrl) {
      extractDominantColor(getFullMediaUrl(coverUrl))
        .then(color => setDominantColor(color || '#1db954'))
        .catch(() => setDominantColor('#1db954'));
    }
  }, [activeSong, hasSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasSong) {
      audio.pause();
      stopCrossfadeImmediately();
      prevSongRef.current = null;
      return;
    }

    const isNewSong = prevSongRef.current !== activeSong;
    const rawSource = activeSong.audio_file_high || activeSong.file_320 || activeSong.audio_file || activeSong.src || activeSong.file || activeSong.audioUrl;
    const selectedSource = getFullMediaUrl(rawSource);

    if (isNewSong) {
      if (audio.src !== selectedSource) {
        audio.src = selectedSource;
      }
      audio.currentTime = 0;
      setCurrentTime(0);

      const isCrossfadingActive = Boolean(outgoingAudioRef.current);
      if (isCrossfadingActive) {
        audio.volume = 0;
      } else {
        audio.volume = isMuted ? 0 : volume;
      }

      const playSafe = async () => {
        try {
          await audio.play();
          if (!isPlaying) setIsPlaying(true);
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.warn("خطای پخش:", e);
          }
        }
      };

      playSafe();
      prevSongRef.current = activeSong;
      hasCrossfadedRef.current = false;
    } else {
      if (isPlaying && audio.paused) {
        if (audio.ended || audio.currentTime >= (audio.duration || 0)) {
          audio.currentTime = 0;
        }
        audio.play().catch(e => { if (e.name !== 'AbortError') console.warn("خطای پخش:", e); });
        if (outgoingAudioRef.current && outgoingAudioRef.current.paused) {
          outgoingAudioRef.current.play().catch(() => {});
        }
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
        if (outgoingAudioRef.current && !outgoingAudioRef.current.paused) {
          outgoingAudioRef.current.pause();
        }
      }
    }

    const handleLoadedMetadata = () => setDuration(audio.duration || activeSong.duration || 0);

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }

      const remainingTime = (audio.duration || 0) - audio.currentTime;

      if (
        crossfadeEnabled && 
        repeatMode !== 'one' && 
        audio.duration && 
        audio.duration > 5 &&
        remainingTime <= 5 && 
        remainingTime > 0 &&
        !hasCrossfadedRef.current && 
        audio.currentTime > 5
      ) {
        hasCrossfadedRef.current = true;
        triggerCrossfadeTransition();
      }
    };

    const handleEnded = () => {
      if (outgoingAudioRef.current) return;

      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().then(() => {
          if (!isPlaying) setIsPlaying(true);
        }).catch((e) => {
          if (e.name !== 'AbortError') console.warn("خطای تکرار آهنگ:", e);
        });
      } else {
        if (playNext) playNext();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeSong, hasSong, isPlaying, isMuted, volume, playNext, crossfadeEnabled, audioQuality, repeatMode, setIsPlaying]);

  useEffect(() => {
    return () => {
      stopCrossfadeImmediately();
    };
  }, []);

  const triggerCrossfadeTransition = () => {
    const audio = audioRef.current;
    if (!audio) return;

    clearCrossfadeTimer();
    if (outgoingAudioRef.current) {
      outgoingAudioRef.current.pause();
      outgoingAudioRef.current = null;
    }

    try {
      const outgoing = new Audio(audio.src);
      outgoing.currentTime = audio.currentTime;
      outgoing.crossOrigin = 'anonymous';
      const startMasterVol = isMutedRef.current ? 0 : volumeRef.current;
      outgoing.volume = startMasterVol;

      outgoingAudioRef.current = outgoing;

      outgoing.play().catch(err => {
        if (err.name !== 'AbortError') console.warn("Outgoing audio error:", err);
      });

      const fadeDurationMs = 5000;
      const startTime = Date.now();

      crossfadeTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / fadeDurationMs);

        const currentMasterVol = isMutedRef.current ? 0 : volumeRef.current;
        const outgoingVol = currentMasterVol * (1 - progress);
        const incomingVol = currentMasterVol * progress;

        if (outgoingAudioRef.current) {
          outgoingAudioRef.current.volume = Math.max(0, Math.min(1, outgoingVol));
        }
        if (audioRef.current) {
          audioRef.current.volume = Math.max(0, Math.min(1, incomingVol));
        }

        if (progress >= 1) {
          clearCrossfadeTimer();
          if (outgoingAudioRef.current) {
            outgoingAudioRef.current.pause();
            outgoingAudioRef.current = null;
          }
          if (audioRef.current) {
            audioRef.current.volume = currentMasterVol;
          }
        }
      }, 50);

      if (playNext) {
        playNext();
      }
    } catch (e) {
      console.warn("Crossfade execution error:", e);
      if (playNext) playNext();
    }
  };

  const toggleRepeatMode = () => {
    let nextMode = 'none';
    if (repeatMode === 'none') nextMode = 'all';
    else if (repeatMode === 'all') nextMode = 'one';
    
    setRepeatMode(nextMode);
    if (user) updateUser({ repeat_mode: nextMode });
  };

  const togglePlay = () => {
    if (!hasSong) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      if (outgoingAudioRef.current) outgoingAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      initAudioPipeline();
      applyQualityFilters(audioQuality);
      audio.play().then(() => {
        if (outgoingAudioRef.current) outgoingAudioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }).catch((e) => {
        if (e.name !== 'AbortError') console.error("Playback error:", e);
      });
    }
  };

  const handleNextClick = () => {
    stopCrossfadeImmediately();
    if (playNext) playNext();
  };

  const handlePreviousClick = () => {
    stopCrossfadeImmediately();
    if (playPrevious) playPrevious();
  };

  const handleSeekChange = (e) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekStart = () => {
    isSeekingRef.current = true;
  };

  const handleSeekEnd = (e) => {
    if (!hasSong || !audioRef.current) return;
    stopCrossfadeImmediately();
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    isSeekingRef.current = false;
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (!crossfadeTimerRef.current && audioRef.current) {
      audioRef.current.volume = newVol;
    }
    setIsMuted(newVol === 0);
    localStorage.setItem('player_volume', newVol.toString());
    if (user) updateUser({ volume: newVol });
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (!crossfadeTimerRef.current && audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const handleArtistClick = () => {
    const artistId = activeSong?.artistId || activeSong?.artist_id || activeSong?.artist;
    if (artistId) navigate(`/artist/${artistId}`);
  };

  const handleAlbumClick = () => {
    const albumId = activeSong?.albumId || activeSong?.album_id || activeSong?.album;
    if (albumId) navigate(`/albums/${albumId}`);
  };

  const handleShuffleToggle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    if (user) updateUser({ shuffle: newShuffle });
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || !secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const songCover = hasSong 
    ? (getFullMediaUrl(activeSong.cover || activeSong.cover_image) || DEFAULT_COVER_SVG)
    : DEFAULT_COVER_SVG;

  const songLyrics = activeSong?.lyrics || activeSong?.lyric || activeSong?.text || currentSong?.lyrics;

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAuthPage = pathname.includes('login') || pathname.includes('auth') || pathname.includes('register');
  const hasToken = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('user') || localStorage.getItem('currentUser');

  if (isAuthPage || !hasToken || !hasSong) {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopCrossfadeImmediately();
    return null;
  }

  return (
    <>
      {showLyrics && (
        <div style={{
          position: 'fixed',
          bottom: '98px',
          right: '24px',
          width: '340px',
          maxHeight: '380px',
          backgroundColor: '#181818',
          border: `1px solid ${dominantColor}`,
          borderRadius: '12px',
          padding: '16px',
          zIndex: 999999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
          color: '#fff',
          overflowY: 'auto',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #282828', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: dominantColor }}>Lyrics</h3>
            <button onClick={() => setShowLyrics(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#e0e0e0', whiteSpace: 'pre-line', margin: 0 }}>
            {songLyrics || 'متن ترانه‌ای برای این آهنگ در سیستم ثبت نشده است.'}
          </p>
        </div>
      )}

      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '90px',
          backgroundColor: '#121212',
          borderTop: '1px solid #282828',
          padding: '0 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 99999,
          boxShadow: '0 -4px 25px rgba(0,0,0,0.85)',
          fontFamily: 'sans-serif',
          direction: 'ltr'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%', minWidth: '220px' }}>
          {hasSong ? (
            <img 
              src={songCover} 
              alt={activeSong.title || 'Song'} 
              style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#282828', border: `1px solid ${dominantColor}` }}
              onError={(e) => { e.target.src = DEFAULT_COVER_SVG; }}
            />
          ) : (
            <div style={{ width: '56px', height: '56px', borderRadius: '6px', backgroundColor: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#535353' }}>
              <Music size={28} />
            </div>
          )}
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hasSong ? activeSong.title : 'آهنگی انتخاب نشده است'}
            </h4>
            <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#b3b3b3', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span 
                onClick={handleArtistClick}
                style={{ cursor: hasSong ? 'pointer' : 'default' }}
                onMouseEnter={(e) => hasSong && (e.target.style.color = dominantColor)}
                onMouseLeave={(e) => (e.target.style.color = '#b3b3b3')}
              >
                {hasSong ? (activeSong.artistName || activeSong.artist_detail?.public_name || activeSong.artist || 'نامشخص') : 'پخش‌کننده آماده است'}
              </span>
              {hasSong && (activeSong.album || activeSong.album_title) && (
                <>
                  <span>•</span>
                  <span 
                    onClick={handleAlbumClick}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.target.style.color = dominantColor)}
                    onMouseLeave={(e) => (e.target.style.color = '#b3b3b3')}
                  >
                    {activeSong.album || activeSong.album_title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', maxWidth: '600px', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
            <button 
              onClick={handleShuffleToggle}
              disabled={!hasSong}
              title="پخش تصادفی"
              style={{ background: 'none', border: 'none', color: shuffle ? dominantColor : '#b3b3b3', cursor: hasSong ? 'pointer' : 'not-allowed', padding: 0 }}
            >
              <Shuffle size={18} />
            </button>
            <button 
              onClick={handlePreviousClick} 
              disabled={!hasSong}
              style={{ background: 'none', border: 'none', color: hasSong ? '#b3b3b3' : '#535353', cursor: hasSong ? 'pointer' : 'not-allowed', padding: 0 }}
            >
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              disabled={!hasSong}
              style={{ 
                backgroundColor: hasSong ? dominantColor : '#535353', 
                border: 'none', 
                borderRadius: '50%', 
                width: '38px', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#000', 
                cursor: hasSong ? 'pointer' : 'not-allowed'
              }}
            >
              {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
            </button>
            <button 
              onClick={handleNextClick} 
              disabled={!hasSong}
              style={{ background: 'none', border: 'none', color: hasSong ? '#b3b3b3' : '#535353', cursor: hasSong ? 'pointer' : 'not-allowed', padding: 0 }}
            >
              <SkipForward size={20} />
            </button>
            <button 
              onClick={toggleRepeatMode}
              disabled={!hasSong}
              title={repeatMode === 'one' ? 'تکرار تک‌آهنگ' : repeatMode === 'all' ? 'تکرار کل' : 'بدون تکرار'}
              style={{ background: 'none', border: 'none', color: repeatMode !== 'none' ? dominantColor : '#b3b3b3', cursor: hasSong ? 'pointer' : 'not-allowed', padding: 0 }}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '11px', color: '#a7a7a7' }}>
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              disabled={!hasSong}
              style={{ 
                flex: 1, 
                height: '4px', 
                accentColor: dominantColor, 
                cursor: hasSong ? 'pointer' : 'not-allowed'
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', width: '30%', minWidth: '220px' }}>
          <button 
            onClick={() => setShowLyrics(!showLyrics)}
            disabled={!hasSong}
            title="Lyrics"
            style={{ background: 'none', border: 'none', color: showLyrics ? dominantColor : '#b3b3b3', cursor: hasSong ? 'pointer' : 'not-allowed', padding: 0 }}
          >
            <FileText size={18} />
          </button>

          <button 
            onClick={toggleCrossfade}
            title="Crossfade"
            style={{ 
              backgroundColor: crossfadeEnabled ? dominantColor : 'transparent', 
              color: crossfadeEnabled ? '#000' : '#b3b3b3',
              border: crossfadeEnabled ? 'none' : '1px solid #535353',
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Sliders size={12} />
            Crossfade
          </button>

          <select 
            value={audioQuality} 
            onChange={handleQualityChange}
            style={{ 
              backgroundColor: '#282828', 
              color: '#fff', 
              border: '1px solid #3e3e3e', 
              borderRadius: '4px', 
              padding: '4px 6px', 
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <option value="high">HQ (320k)</option>
            <option value="low">LQ (128k)</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={toggleMute}
              style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: 0 }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              style={{ width: '60px', height: '4px', accentColor: dominantColor, cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}