// src/services/reportApi.js
import apiClient from './apiClient';

// برای هنرمند (در داشبورد هنرمند)
export async function fetchArtistReports() {
  const { data } = await apiClient.get('/reports/artist/');
  return data; // لیست گزارش‌های ماهانه خود هنرمند
}

// برای ادمین (جدول حسابرسی)
export async function fetchAdminReports(year, month) {
  const { data } = await apiClient.get(`/reports/admin/?year=${year}&month=${month}`);
  return data;
}

// برای ادمین (تسویه حساب)
export async function settleArtist(artistId, year, month) {
  const { data } = await apiClient.post(`/reports/admin/settle/${artistId}/`, {
    year, month
  });
  return data;
}

// برای ادمین (آمار کلان داشبورد)
export async function fetchAdminStats() {
  const { data } = await apiClient.get('/reports/admin/stats/');
  return data;
}

// دریافت لیست آرتیست‌های در انتظار تایید
export async function fetchPendingArtists() {
  const { data } = await apiClient.get('/auth/users/?role=artist&status=pending');
  return Array.isArray(data) ? data : (data.results || []);
}

// تایید یا رد کردن آرتیست
export async function updateArtistStatus(id, updateData) {
  const { data } = await apiClient.patch(`/auth/users/${id}/`, updateData);
  return data;
}

// دریافت قیمت‌های فعلی اشتراک برای ادمین
export async function fetchAdminPricing() {
  const { data } = await apiClient.get('/subscriptions/admin/pricing/');
  return data;
}

// به‌روزرسانی قیمت‌های جدید اشتراک
export async function updateAdminPricing(silverPrice, goldPrice) {
  const { data } = await apiClient.post('/subscriptions/admin/pricing/', {
    silver_price: Number(silverPrice),
    gold_price: Number(goldPrice),
  });
  return data;
}
// دریافت آمار لحظه‌ای کل کاتالوگ هنرمند
export async function fetchArtistOverview() {
  const { data } = await apiClient.get('/reports/artist/overview/');
  return data;
}