// src/services/paymentApi.js
import apiClient from './apiClient';

export async function createPayment(tier, billing_period_months) {
  const { data } = await apiClient.post('/payments/create/', {
    tier,
    billing_period_months
  });
  return data; // برمی‌گرداند: { payment_url, authority, transaction_id }
}