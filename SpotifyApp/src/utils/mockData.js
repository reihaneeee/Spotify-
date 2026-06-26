/**
 * Mock Data Initializer
 * Seeds localStorage with sample playlists, albums, and songs
 * so the Home page has content to display.
 */

export const initMockData = () => {
  // Songs
  if (!localStorage.getItem('songs')) {
    const songs = [
      { id: 's1', title: 'Midnight City', artist: 'Neon Pulse', cover: 'https://picsum.photos/seed/s1/300', plays: 1820000, duration: 213 },
      { id: 's2', title: 'Ocean Drive', artist: 'Coastal Waves', cover: 'https://picsum.photos/seed/s2/300', plays: 1540000, duration: 198 },
      { id: 's3', title: 'Golden Hour', artist: 'Sunset Boulevard', cover: 'https://picsum.photos/seed/s3/300', plays: 2310000, duration: 225 },
      { id: 's4', title: 'Electric Dreams', artist: 'Synth Riders', cover: 'https://picsum.photos/seed/s4/300', plays: 980000, duration: 187 },
      { id: 's5', title: 'Paper Planes', artist: 'Indie Skies', cover: 'https://picsum.photos/seed/s5/300', plays: 1290000, duration: 241 },
      { id: 's6', title: 'Velvet Sky', artist: 'Moonlit Trio', cover: 'https://picsum.photos/seed/s6/300', plays: 760000, duration: 205 },
      { id: 's7', title: 'Lost Signals', artist: 'Echo Chamber', cover: 'https://picsum.photos/seed/s7/300', plays: 2050000, duration: 230 },
      { id: 's8', title: 'Crimson Fields', artist: 'Aurora Lights', cover: 'https://picsum.photos/seed/s8/300', plays: 1110000, duration: 219 },
    ];
    localStorage.setItem('songs', JSON.stringify(songs));
  }

  // Albums
  if (!localStorage.getItem('albums')) {
    const albums = [
      { id: 'a1', title: 'Night Visions', artist: 'Neon Pulse', cover: 'https://picsum.photos/seed/a1/300', year: 2026, trackCount: 12 },
      { id: 'a2', title: 'Coastline', artist: 'Coastal Waves', cover: 'https://picsum.photos/seed/a2/300', year: 2025, trackCount: 10 },
      { id: 'a3', title: 'Sundown', artist: 'Sunset Boulevard', cover: 'https://picsum.photos/seed/a3/300', year: 2026, trackCount: 9 },
      { id: 'a4', title: 'Circuit Breaker', artist: 'Synth Riders', cover: 'https://picsum.photos/seed/a4/300', year: 2024, trackCount: 14 },
      { id: 'a5', title: 'Skylines', artist: 'Indie Skies', cover: 'https://picsum.photos/seed/a5/300', year: 2026, trackCount: 8 },
      { id: 'a6', title: 'Moonrise', artist: 'Moonlit Trio', cover: 'https://picsum.photos/seed/a6/300', year: 2025, trackCount: 11 },
    ];
    localStorage.setItem('albums', JSON.stringify(albums));
  }

  // Playlists
  if (!localStorage.getItem('playlists')) {
    const playlists = [
      { id: 'p1', title: 'Chill Vibes', owner: 'Spotify Clone', cover: 'https://picsum.photos/seed/p1/300', songCount: 42, createdAt: '2026-06-20' },
      { id: 'p2', title: 'Workout Mix', owner: 'Spotify Clone', cover: 'https://picsum.photos/seed/p2/300', songCount: 30, createdAt: '2026-06-18' },
      { id: 'p3', title: 'Focus Flow', owner: 'Spotify Clone', cover: 'https://picsum.photos/seed/p3/300', songCount: 55, createdAt: '2026-06-22' },
      { id: 'p4', title: 'Throwback Hits', owner: 'Spotify Clone', cover: 'https://picsum.photos/seed/p4/300', songCount: 38, createdAt: '2026-06-15' },
      { id: 'p5', title: 'Late Night', owner: 'Spotify Clone', cover: 'https://picsum.photos/seed/p5/300', songCount: 27, createdAt: '2026-06-24' },
      { id: 'p6', title: 'Morning Coffee', owner: 'Spotify Clone', cover: 'https://picsum.photos/seed/p6/300', songCount: 33, createdAt: '2026-06-23' },
    ];
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }

  // Early access content (gold subscribers only)
  if (!localStorage.getItem('earlyAccess')) {
    const earlyAccess = [
      { id: 'e1', title: 'Unreleased Single', artist: 'Neon Pulse', cover: 'https://picsum.photos/seed/e1/300', releaseDate: '2026-07-10' },
      { id: 'e2', title: 'Exclusive Live Session', artist: 'Aurora Lights', cover: 'https://picsum.photos/seed/e2/300', releaseDate: '2026-07-05' },
      { id: 'e3', title: 'Demo Tape', artist: 'Echo Chamber', cover: 'https://picsum.photos/seed/e3/300', releaseDate: '2026-07-15' },
    ];
    localStorage.setItem('earlyAccess', JSON.stringify(earlyAccess));
  }

  // Artists
  const artists = [
    {
      id: 'artist-1',
      name: 'Nova Waves',
      bio: 'Electronic music producer blending ambient soundscapes with progressive beats.',
      avatar: 'https://i.pravatar.cc/200?img=33',
      verified: true,
      listeners: 1250000,
      streams: 45000000,
      albums: ['album-1', 'album-2'],
      singles: ['song-1', 'song-3'],
    },
    {
      id: 'artist-2',
      name: 'Luna Ray',
      bio: 'Singer-songwriter crafting indie folk stories with raw emotion.',
      avatar: 'https://i.pravatar.cc/200?img=44',
      verified: false,
      listeners: 320000,
      streams: 8500000,
      albums: ['album-3'],
      singles: ['song-2', 'song-5'],
    },
    {
      id: 'artist-3',
      name: 'The Midnight Echo',
      bio: 'Alternative rock band pushing boundaries since 2018.',
      avatar: 'https://i.pravatar.cc/200?img=68',
      verified: true,
      listeners: 2100000,
      streams: 92000000,
      albums: ['album-4'],
      singles: ['song-4', 'song-6'],
    },
  ];

  localStorage.setItem('artists', JSON.stringify(artists));
};

// Helper getters
export const getSongs = () => JSON.parse(localStorage.getItem('songs') || '[]');
export const getAlbums = () => JSON.parse(localStorage.getItem('albums') || '[]');
export const getPlaylists = () => JSON.parse(localStorage.getItem('playlists') || '[]');
export const getEarlyAccess = () => JSON.parse(localStorage.getItem('earlyAccess') || '[]');

export function getArtists() {
  return JSON.parse(localStorage.getItem('artists') || '[]');
}

export function getArtistById(id) {
  const artists = getArtists();
  const artist = artists.find((a) => a.id === id);
  if (!artist) return null;

  const songs = getSongs();
  const albums = getAlbums();

  return {
    ...artist,
    albums: artist.albums.map((aid) => albums.find((al) => al.id === aid)).filter(Boolean),
    singles: artist.singles.map((sid) => songs.find((s) => s.id === sid)).filter(Boolean),
  };
}

export function followArtist(username, artistId) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return;

  if (!users[idx].following) users[idx].following = [];
  if (!users[idx].following.includes(artistId)) {
    users[idx].following.push(artistId);
  }

  localStorage.setItem('users', JSON.stringify(users));

  // به‌روزرسانی currentUser
  const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (current && current.username === username) {
    current.following = users[idx].following;
    localStorage.setItem('currentUser', JSON.stringify(current));
  }
}

export function unfollowArtist(username, artistId) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return;

  if (!users[idx].following) users[idx].following = [];
  users[idx].following = users[idx].following.filter((id) => id !== artistId);

  localStorage.setItem('users', JSON.stringify(users));

  const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (current && current.username === username) {
    current.following = users[idx].following;
    localStorage.setItem('currentUser', JSON.stringify(current));
  }
}

export function isFollowing(username, artistId) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u) => u.username === username);
  return user?.following?.includes(artistId) ?? false;
}

// ===== FIX: Safe formatPlays to prevent crash on undefined =====
export const formatPlays = (plays) => {
  if (plays === undefined || plays === null || plays === 0) return '0';
  if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
};