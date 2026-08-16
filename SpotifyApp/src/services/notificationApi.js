// src/services/notificationApi.js
// Replaces the localStorage 'spotify_notifications' array (utils/notificationEngine.js
// reader side) with real reads from backend/notifications. Notifications are
// now *created* server-side (accounts/signals.py, catalog/signals.py) when
// the triggering event happens, instead of the frontend writing them
// directly to storage.

import apiClient from './apiClient';

export async function fetchMyNotifications() {
  const { data } = await apiClient.get('/notifications/');
  return data.results ?? data;
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.post(`/notifications/${id}/read/`);
  return data;
}

export async function markAllNotificationsRead() {
  await apiClient.post('/notifications/mark-all-read/');
}

export async function deleteNotification(id) {
  await apiClient.delete(`/notifications/${id}/`);
}
