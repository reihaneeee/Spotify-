// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  // 🟢 استیت‌های اصلی نسخه اولیه شما کاملاً حفظ شده‌اند
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🔴 تابع داخلی و کاملاً مستقل برای ثبت آمار استریم در لوکال استوریج
  const recordTrackStream = (song) => {
    if (!song) return;

    // پیدا کردن ایمیل کاربر جاری از لوکال استوریج برای تشخیص شنونده منحصربه‌فرد
    const activeUser = JSON.parse(localStorage.getItem('spotify_current_user') || '{}');
    const userIdentifier = activeUser.email || 'anonymous_listener';

    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');

    const updatedPlaylists = playlists.map(p => {
      if (!p.songs) return p;
      const updatedSongs = p.songs.map(item => {
        // حالت اول: اگر آیتم تک‌آهنگِ کلیک‌شده باشد
        if (item.itemType === 'song' && item.id === song.id) {
          const currentListeners = item.listeners || [];
          return {
            ...item,
            plays: (item.plays || 0) + 1,
            listeners: currentListeners.includes(userIdentifier) ? currentListeners : [...currentListeners, userIdentifier]
          };
        }
        // حالت دوم: اگر آیتم یک آلبوم باشد و این آهنگ زیرمجموعه آن آلبوم باشد
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
              plays: (item.plays || 0) + 1, // افزایش مجموع استریم آلبوم
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

  // 🟢 متد پخش اصلی شما با همان ساختار دو پارامتره اولیه (۱۰۰٪ سازگار)
  const playSong = (song, upcomingSongs = []) => {
    // سناریو اول: اگر آهنگی در حال پخش نبود یا آهنگ متفاوتی انتخاب شد، آمار استریم ثبت می‌شود
    if (!currentSong || currentSong.id !== song.id) {
      recordTrackStream(song);
    }
    
    setCurrentSong(song);
    setQueue(upcomingSongs);
    setIsPlaying(true);
  };

  return (
    <PlaybackContext.Provider value={{ 
      currentSong, setCurrentSong, 
      queue, setQueue, 
      isPlaying, setIsPlaying, 
      playSong, recordTrackStream /* 🟢 اضافه شدن متد آمار برای استفاده در پروگرس‌بار پلیر */
    }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => useContext(PlaybackContext);