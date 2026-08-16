// src/components/settings/PaymentHistory.jsx

import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await apiClient.get('/subscriptions/my/');
        const historyList = Array.isArray(data) ? data : (data?.results || []);
        setPayments(historyList);
      } catch (err) {
        console.error('Failed to fetch payment history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <section className="settings-section">
      <h2 className="section-title">Payment History</h2>

      {loading ? (
        <p className="section-description">Loading payment history...</p>
      ) : payments.length === 0 ? (
        <p className="section-description">No payment history available.</p>
      ) : (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, idx) => (
              <tr key={p.id || idx}>
                <td>{p.start_date || p.created_at ? new Date(p.start_date || p.created_at).toLocaleDateString() : '-'}</td>
                <td>{p.plan?.name || p.plan?.tier || 'Subscription'}</td>
                <td>{p.price_paid ? `${Number(p.price_paid).toLocaleString()} IRR` : 'Paid'}</td>
                <td>
                  <span className={`status-badge ${p.is_active || p.payment_status === 'paid' ? 'status-paid' : ''}`}>
                    {p.payment_status || (p.is_active ? 'Active' : 'Expired')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}