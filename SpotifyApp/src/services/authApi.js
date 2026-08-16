// src/services/authApi.js
// Replaces src/utils/auth.js's localStorage-based fake auth with real calls
// to the accounts app (phase 2 part 3.1). Matches endpoints registered in
// backend/accounts/urls.py.

import apiClient, { tokenStorage } from './apiClient';

export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login/', { email, password });
  tokenStorage.set(data.access, data.refresh);
  return data.user;
}

export async function registerListener(payload) {
  // payload: { email, password, password_confirm, display_name, birth_date, gender, accepted_privacy_policy }
  const { data } = await apiClient.post('/auth/register/', payload);
  return data;
}

export async function registerArtist(payload) {
  // payload: { email, password, artist_name, portfolio_links, bio }
  const { data } = await apiClient.post('/auth/register/artist/', payload);
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get('/auth/me/');
  return data;
}

export async function updateMe(updates) {
  const isFormData = updates instanceof FormData;
  const { data } = await apiClient.patch('/auth/me/', updates, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
}

export async function deleteMyAccount() {
  await apiClient.delete('/auth/me/');
  tokenStorage.clear();
}

export async function changePassword(old_password, new_password) {
  const { data } = await apiClient.post('/auth/change-password/', { old_password, new_password });
  return data;
}

export function logout() {
  tokenStorage.clear();
}

export async function fetchUserProfile(userId) {
  const { data } = await apiClient.get(`/auth/users/${userId}/`);
  return data;
}

export async function followArtist(userId) {
  await apiClient.post(`/auth/users/${userId}/follow/`);
}

export async function unfollowArtist(userId) {
  await apiClient.post(`/auth/users/${userId}/unfollow/`);
}
