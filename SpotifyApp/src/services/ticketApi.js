// src/services/ticketApi.js
import apiClient from './apiClient';

// دریافت لیست تیکت‌ها (توسط کاربر یا ادمین)
export async function fetchTickets() {
  const { data } = await apiClient.get('/tickets/');
  return Array.isArray(data) ? data : (data.results || []);
}

// ساخت تیکت جدید
export async function createTicket(subject, message) {
  const { data } = await apiClient.post('/tickets/', { subject, message });
  return data;
}

// ارسال پاسخ برای یک تیکت
export async function replyTicket(ticketId, text) {
  const { data } = await apiClient.post(`/tickets/${ticketId}/reply/`, { text });
  return data;
}

// بستن تیکت
export async function closeTicketApi(ticketId) {
  const { data } = await apiClient.patch(`/tickets/${ticketId}/close/`);
  return data;
}