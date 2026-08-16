// src/components/settings/ManageSubscription.jsx

import { useState, useEffect } from 'react';
import { createPayment } from '../../services/paymentApi';
import apiClient from '../../services/apiClient';

export default function ManageSubscription({ user }) {
  const [loading, setLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([
    { id: 'basic', name: 'Basic', price: 'Free' },
    { id: 'silver', name: 'Silver', price: 'Loading...' },
    { id: 'gold', name: 'Gold', price: 'Loading...' },
  ]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        // دریافت لیست تمام پلن‌های فعال از بک‌اند
        const res = await apiClient.get('/subscriptions/plans/');
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);

        let silverPriceVal = null;
        let goldPriceVal = null;

        data.forEach((p) => {
          const tier = (p.tier || p.name || '').toLowerCase();
          const price = p.price_monthly ?? p.price ?? p.price_per_month;
          if (tier === 'silver') silverPriceVal = price;
          if (tier === 'gold') goldPriceVal = price;
        });

        setPlans([
          { id: 'basic', name: 'Basic', price: 'Free' },
          {
            id: 'silver',
            name: 'Silver',
            price: silverPriceVal !== null && silverPriceVal !== undefined
              ? `${Number(silverPriceVal).toLocaleString()} IRR`
              : '150,000 IRR'
          },
          {
            id: 'gold',
            name: 'Gold',
            price: goldPriceVal !== null && goldPriceVal !== undefined
              ? `${Number(goldPriceVal).toLocaleString()} IRR`
              : '300,000 IRR'
          },
        ]);
      } catch (err) {
        console.error('Failed to fetch plan pricing', err);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handlePayment = async (tierId) => {
    if (tierId === 'basic') {
      alert('Basic plan is free. No payment required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createPayment(tierId, 1); // ۱ ماهه
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setError('خطا در دریافت لینک پرداخت.');
      }
    } catch (err) {
      setError('مشکلی در ارتباط با سرور پیش آمده.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="settings-section">
      <h2 className="section-title">Manage Subscription</h2>
      <div className="subscription-plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${user?.subscription === plan.id ? 'active' : ''}`}
          >
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>

            {user?.subscription === plan.id ? (
              <span className="plan-badge">Current plan</span>
            ) : (
              <button
                className="btn-plan"
                onClick={() => handlePayment(plan.id)}
                disabled={loading || pricesLoading}
              >
                {loading ? 'Processing...' : `Switch to ${plan.name}`}
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="form-error" style={{ color: 'red' }}>{error}</p>}
    </section>
  );
}