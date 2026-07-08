// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); 

  const recordTrackStream = (song) => {
    if (!song) return;
    const activeUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('spotify_current_user') || '{}');
    const userIdentifier = activeUser.username || activeUser.email || 'anonymous_listener';

    // ۱. آپدیت پلی‌لیست‌ها
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const updatedPlaylists = playlists.map(p => {
      if (!p.songs) return p;
      const updatedSongs = p.songs.map(item => {
        if (item.itemType === 'song' && item.id === song.id) {
          const users = Array.isArray(item.uniqueUsers) ? [...item.uniqueUsers] : (Array.isArray(item.listenerIds) ? [...item.listenerIds] : []);
          if (!users.includes(userIdentifier)) users.push(userIdentifier);
          return { ...item, plays: (item.plays || 0) + 1, uniqueUsers: users, listeners: users.length, listenerIds: users };
        }
        return item;
      });
      return { ...p, songs: updatedSongs };
    });
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));

    // ۲. آپدیت دیتابیس اصلی هنرمندان به صورت تفکیک‌شده (آهنگ مجزا، آلبوم مجزا)
    const storedWorks = JSON.parse(localStorage.getItem('artist_works') || '[]');
    const updatedWorks = storedWorks.map(w => {
      // اگر سینگل باشد
      if (w.type === 'single' && w.id === song.id) {
        const users = Array.isArray(w.uniqueUsers) ? [...w.uniqueUsers] : [];
        if (!users.includes(userIdentifier)) users.push(userIdentifier);
        return { ...w, plays: (w.plays || 0) + 1, uniqueUsers: users, listeners: users.length };
      }
      
      // اگر آلبوم باشد
      if (w.type === 'album' && w.tracks) {
        let isAlbumTrackPlayed = false;
        const updatedTracks = w.tracks.map(t => {
          if (t.id === song.id) {
            isAlbumTrackPlayed = true;
            // آپدیت آمار مختص به همین Track
            const trackUsers = Array.isArray(t.uniqueUsers) ? [...t.uniqueUsers] : [];
            if (!trackUsers.includes(userIdentifier)) trackUsers.push(userIdentifier);
            return { ...t, plays: (t.plays || 0) + 1, uniqueUsers: trackUsers, listeners: trackUsers.length };
          }
          return t;
        });

        if (isAlbumTrackPlayed) {
          // آپدیت آمار کل آلبوم به صورت موازی
          const albumUsers = Array.isArray(w.uniqueUsers) ? [...w.uniqueUsers] : [];
          if (!albumUsers.includes(userIdentifier)) albumUsers.push(userIdentifier);
          return { ...w, plays: (w.plays || 0) + 1, uniqueUsers: albumUsers, listeners: albumUsers.length, tracks: updatedTracks };
        }
      }
      return w;
    });
    
    localStorage.setItem('artist_works', JSON.stringify(updatedWorks));
  };

  const playNext = () => {
    if (queue.length === 0 || !currentSong) return;
    if (repeatMode === 'one') {
      setCurrentSong({ ...currentSong });
      setIsPlaying(true);
      return;
    }
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      const nextSong = queue[randomIndex];
      recordTrackStream(nextSong);
      setCurrentSong(nextSong);
      setIsPlaying(true);
      return;
    }
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      recordTrackStream(nextSong);
      setCurrentSong(nextSong);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      const firstSong = queue[0];
      recordTrackStream(firstSong);
      setCurrentSong(firstSong);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      recordTrackStream(prevSong);
      setCurrentSong(prevSong);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      const lastSong = queue[queue.length - 1];
      recordTrackStream(lastSong);
      setCurrentSong(lastSong);
      setIsPlaying(true);
    }
  };

  const playSong = (song, upcomingSongs = []) => {
    if (!currentSong || currentSong.id !== song.id) {
      recordTrackStream(song);
    }
    setCurrentSong(song);
    const fullQueue = [song, ...upcomingSongs.filter(s => s.id !== song.id)];
    setQueue(fullQueue);
    setIsPlaying(true);
  };

  return (
    <PlaybackContext.Provider value={{ 
      currentSong, setCurrentSong, queue, setQueue, isPlaying, setIsPlaying, shuffle, setShuffle, repeatMode, setRepeatMode, playSong, playNext, playPrevious, recordTrackStream 
    }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => useContext(PlaybackContext);