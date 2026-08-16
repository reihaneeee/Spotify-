import apiClient from './apiClient';

const BACKEND_BASE = 'http://127.0.0.1:8000';

export const getFullMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_BASE}${cleanUrl}`;
};

export async function fetchSongs({ search = '', ordering = '-_play_count', album, artist } = {}) {
  const { data } = await apiClient.get('/catalog/songs/', {
    params: { search, ordering, album, artist },
  });
  return data.results ?? data;
}

export async function fetchAlbums({ search = '', ordering = '-release_date', artist } = {}) {
  const { data } = await apiClient.get('/catalog/albums/', {
    params: { search, ordering, artist },
  });
  return data.results ?? data;
}

export async function fetchAlbum(albumId) {
  const { data } = await apiClient.get(`/catalog/albums/${albumId}/`);
  return data;
}

export async function fetchSong(songId) {
  const { data } = await apiClient.get(`/catalog/songs/${songId}/`);
  return data;
}

export async function recordStream(songId) {
  const { data } = await apiClient.post(`/catalog/songs/${songId}/stream/`);
  return data;
}

// اصلاح آدرس‌ها به /auth/users/
export async function fetchArtist(artistId) {
  const { data } = await apiClient.get(`/auth/users/${artistId}/`);
  return data;
}

export async function followArtistApi(artistId) {
  const { data } = await apiClient.post(`/auth/users/${artistId}/follow/`);
  return data;
}

export async function unfollowArtistApi(artistId) {
  const { data } = await apiClient.post(`/auth/users/${artistId}/unfollow/`);
  return data;
}

export async function createSong(formData) {
  const { data } = await apiClient.post('/catalog/songs/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateSong(songId, formData) {
  const { data } = await apiClient.patch(`/catalog/songs/${songId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteSong(songId) {
  await apiClient.delete(`/catalog/songs/${songId}/`);
}

export async function createAlbum(formData) {
  const { data } = await apiClient.post('/catalog/albums/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateAlbum(albumId, formData) {
  const { data } = await apiClient.patch(`/catalog/albums/${albumId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteAlbum(albumId) {
  await apiClient.delete(`/catalog/albums/${albumId}/`);
}