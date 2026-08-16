// src/services/subscriptionApi.js
import apiClient from './apiClient';

export async function fetchPlans() {
  const { data } = await apiClient.get('/subscriptions/plans/');
  return data.results || data; // paginated or not, depending on DRF settings
}

export async function fetchMySubscription() {
  const { data } = await apiClient.get('/subscriptions/my/');
  return data; // { plan: {...}, is_active, end_date, ... }
}

export async function subscribe(tier, billingPeriodMonths) {
  const { data } = await apiClient.post('/subscriptions/subscribe/', {
    tier,
    billing_period_months: billingPeriodMonths,
  });
  return data;
}

// Admin-only (spec 2.11.3)
export async function updatePlanPrice(tier, priceMonthly) {
  const { data } = await apiClient.patch(`/subscriptions/plans/${tier}/price/`, {
    price_monthly: priceMonthly,
  });
  return data;
}
