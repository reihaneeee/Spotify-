// src/context/PlaybackContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song, upcomingSongs = []) => {
    setCurrentSong(song);
    setQueue(upcomingSongs);
    setIsPlaying(true);
  };

  return (
    <PlaybackContext.Provider value={{ currentSong, setCurrentSong, queue, setQueue, isPlaying, setIsPlaying, playSong }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => useContext(PlaybackContext);