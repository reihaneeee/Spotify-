// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]); // لیست کل آهنگ‌های آلبوم، پلی‌لیست یا آرشیو فعلی
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'all' | 'one'

  // تابع مستقل ثبت آمار استریم در لوکال استوریج (کد شما)
  const recordTrackStream = (song) => {
    if (!song) return;
    const activeUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('spotify_current_user') || '{}');
    const userIdentifier = activeUser.email || 'anonymous_listener';
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');

    const updatedPlaylists = playlists.map(p => {
      if (!p.songs) return p;
      const updatedSongs = p.songs.map(item => {
        if (item.itemType === 'song' && item.id === song.id) {
          const currentListeners = item.listeners || [];
          return {
            ...item,
            plays: (item.plays || 0) + 1,
            listeners: currentListeners.includes(userIdentifier) ? currentListeners : [...currentListeners, userIdentifier]
          };
        }
        if (item.itemType === 'album') {
          let albumPlayed = false;
          const updatedTracks = (item.tracks || []).map(track => {
            if (track.id === song.id) {
              albumPlayed = true;
              const trackListeners = track.listeners || [];
              return {
                ...track,
                plays: (track.plays || 0) + 1,
                listeners: trackListeners.includes(userIdentifier) ? trackListeners : [...trackListeners, userIdentifier]
              };
            }
            return track;
          });

          if (albumPlayed) {
            const albumListeners = item.listeners || [];
            return {
              ...item,
              plays: (item.plays || 0) + 1,
              listeners: albumListeners.includes(userIdentifier) ? albumListeners : [...albumListeners, userIdentifier],
              tracks: updatedTracks
            };
          }
        }
        return item;
      });
      return { ...p, songs: updatedSongs };
    });
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };

  // 🔀 ⏭️ تابع هوشمند رفتن به آهنگ بعدی با پشتیبانی از شافل و ریپیت
  const playNext = () => {
    if (queue.length === 0 || !currentSong) return;

    // اگر حالت تکرار روی یک آهنگ (one) باشد، همان آهنگ را دوباره از اول پخش کن
    if (repeatMode === 'one') {
      setCurrentSong({ ...currentSong }); // ایجاد ریفرنس جدید برای لود مجدد
      setIsPlaying(true);
      return;
    }

    // اگر حالت شافل (پخش تصادفی) روشن بود
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      const nextSong = queue[randomIndex];
      recordTrackStream(nextSong);
      setCurrentSong(nextSong);
      setIsPlaying(true);
      return;
    }

    // پیدا کردن ایندکس آهنگ فعلی در صف پخش
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      // رفتن به آهنگ بعدی در صف
      const nextSong = queue[currentIndex + 1];
      recordTrackStream(nextSong);
      setCurrentSong(nextSong);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      // اگر به آخر صف رسیدیم و حالت تکرار لیست (all) روشن بود، برگشت به آهنگ اول
      const firstSong = queue[0];
      recordTrackStream(firstSong);
      setCurrentSong(firstSong);
      setIsPlaying(true);
    } else {
      // در غیر این صورت پخش متوقف می‌شود
      setIsPlaying(false);
    }
  };

  // ⏮️ تابع رفتن به آهنگ قبلی
  const playPrevious = () => {
    if (queue.length === 0 || !currentSong) return;

    // پیدا کردن ایندکس آهنگ فعلی
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);

    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      recordTrackStream(prevSong);
      setCurrentSong(prevSong);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      // اگر روی آهنگ اول بودیم و دکمه قبلی را زدیم، رفتن به آخرین آهنگ لیست
      const lastSong = queue[queue.length - 1];
      recordTrackStream(lastSong);
      setCurrentSong(lastSong);
      setIsPlaying(true);
    }
  };

  // متد پخش اصلی با تنظیم کامل صف پخش
  const playSong = (song, upcomingSongs = []) => {
    if (!currentSong || currentSong.id !== song.id) {
      recordTrackStream(song);
    }
    
    setCurrentSong(song);
    // 🔥 فیکس فوق‌العاده مهم: ترکیب آهنگ انتخابی با بقیه آهنگ‌های لیست درون یک صف (Queue) واحد
    // تا دکمه‌های بعدی/قبلی بدانند آهنگ‌های دیگر همان بخش چیست
    const fullQueue = [song, ...upcomingSongs.filter(s => s.id !== song.id)];
    setQueue(fullQueue);
    setIsPlaying(true);
  };

  return (
    <PlaybackContext.Provider value={{ 
      currentSong, setCurrentSong, 
      queue, setQueue, 
      isPlaying, setIsPlaying, 
      shuffle, setShuffle,
      repeatMode, setRepeatMode,
      playSong, playNext, playPrevious, recordTrackStream 
    }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => useContext(PlaybackContext);