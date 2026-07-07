// src/pages/Home.jsx

import { useState } from 'react';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import Showcase from '../components/home/Showcase';
import EarlyAccess from '../components/home/EarlyAccess';
import { getCurrentUser } from '../utils/auth';
import {
  initMockData,
  getSongs,
  getAlbums,
  getPlaylists,
  getEarlyAccess,
} from '../utils/mockData';
import '../styles/home.css';

/**
 * Home Page
 * Personalized landing page with showcase rows, early access,
 * a sidebar and a header. Content adapts to the user's role/subscription.
 */
function Home() {

    initMockData();

    const [user] = useState(() => getCurrentUser());
    const [songs] = useState(() => getSongs());
    const [albums] = useState(() => getAlbums());
    const [playlists] = useState(() => getPlaylists());
    const [earlyAccess] = useState(() => getEarlyAccess());

  // Latest playlists/albums: sorted by date (newest first)
  const latestPlaylists = [...playlists].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const latestAlbums = [...albums].sort((a, b) => b.year - a.year);

  // Most played songs: sorted by play count
  const topSongs = [...songs].sort((a, b) => b.plays - a.plays);

  // Gold subscription check
  const isGold = user?.subscription === 'gold';

  return (
    <div className="home-layout">
      <Sidebar user={user} />

      <main className="home-main">
        <Header user={user} />

        <div className="home-content">
          <Showcase
            title="Latest Playlists"
            items={latestPlaylists}
            type="playlist"
          />

          <Showcase
            title="Latest Albums"
            items={latestAlbums}
            type="album"
          />

          <Showcase
            title="Most Played Songs"
            items={topSongs}
            type="song"
          />

          <EarlyAccess items={earlyAccess} isGold={isGold} />
        </div>
      </main>
    </div>
  );
}

export default Home;
