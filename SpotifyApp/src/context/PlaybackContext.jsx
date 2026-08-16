import React, { createContext, useContext, useState } from 'react';
import { recordStream } from '../services/catalogApi';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [streamLimitReached, setStreamLimitReached] = useState(false);

  const recordTrackStream = async (song) => {
    if (!song?.id) return;
    try {
      await recordStream(song.id);
      setStreamLimitReached(false);
    } catch (err) {
      console.warn("خطا در ثبت استریم آهنگ در بک‌اند:", err);
      if (err?.response?.status === 403 && err?.response?.data?.detail?.includes('limit')) {
        setStreamLimitReached(true);
      }
    }
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
      // ساخت رفرنس جدید جهت تشخیص پخش مجدد حتی اگر همان آهنگ انتخاب شود
      setCurrentSong({ ...nextSong });
      setIsPlaying(true);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      recordTrackStream(nextSong);
      setCurrentSong({ ...nextSong });
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      const firstSong = queue[0];
      recordTrackStream(firstSong);
      setCurrentSong({ ...firstSong });
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      recordTrackStream(prevSong);
      setCurrentSong({ ...prevSong });
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      const lastSong = queue[queue.length - 1];
      recordTrackStream(lastSong);
      setCurrentSong({ ...lastSong });
      setIsPlaying(true);
    }
  };

  const playSong = (song, upcomingSongs = []) => {
    if (!currentSong || currentSong.id !== song.id) {
      recordTrackStream(song);
    }
    setCurrentSong({ ...song });
    const fullQueue = [song, ...upcomingSongs.filter((s) => s.id !== song.id)];
    setQueue(fullQueue);
    setIsPlaying(true);
  };

  return (
    <PlaybackContext.Provider
      value={{
        currentSong, setCurrentSong, queue, setQueue, isPlaying, setIsPlaying,
        shuffle, setShuffle, repeatMode, setRepeatMode, playSong, playNext,
        playPrevious, recordTrackStream, streamLimitReached,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => useContext(PlaybackContext);