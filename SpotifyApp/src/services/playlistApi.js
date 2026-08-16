// src/services/playlistApi.js
// Replaces the localStorage 'playlists' array with real CRUD against
// backend/playlists (phase 2 parts 3.1 + 3.2). The backend enforces the
// subscription playlist-count limit itself (basic=6/silver=100/gold=∞) --
// on a 403 here, show plan.detail to the user instead of re-checking a
// hardcoded limit table on the frontend (see subscriptionApi.fetchMySubscription
// for the numbers to *display* proactively in the UI).

import apiClient from './apiClient';

export async function fetchMyPlaylists() {
  const { data } = await apiClient.get('/playlists/');
  return { playlists: data.results ?? data, remaining: data.playlists_remaining };
}

export async function fetchPlaylist(playlistId) {
  const { data } = await apiClient.get(`/playlists/${playlistId}/`);
  return data;
}

export async function createPlaylist(title) {
  const { data } = await apiClient.post('/playlists/', { title });
  return data;
}

export async function renamePlaylist(playlistId, title) {
  const { data } = await apiClient.patch(`/playlists/${playlistId}/`, { title });
  return data;
}

export async function deletePlaylist(playlistId) {
  await apiClient.delete(`/playlists/${playlistId}/`);
}

export async function addTrackToPlaylist(playlistId, songId) {
  const { data } = await apiClient.post(`/playlists/${playlistId}/tracks/`, { song_id: songId });
  return data;
}

export async function removeTrackFromPlaylist(playlistId, songId) {
  const { data } = await apiClient.delete(`/playlists/${playlistId}/tracks/${songId}/`);
  return data;
}

// Convenience for "add whole album to playlist" (spec's playlist UI only
// requires per-song add, so this loops client-side rather than needing a
// dedicated backend action).
export async function addAlbumToPlaylist(playlistId, songIds) {
  let last;
  for (const songId of songIds) {
    last = await addTrackToPlaylist(playlistId, songId);
  }
  return last;
}
