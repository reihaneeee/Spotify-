import { useState } from 'react';

// داده‌های فیک برای تاریخچه پرداخت
const MOCK_PAYMENTS = [
  { id: 1, date: '2026-06-01', amount: '$9.99', plan: 'Gold', status: 'Paid' },
  { id: 2, date: '2026-05-01', amount: '$9.99', plan: 'Gold', status: 'Paid' },
  { id: 3, date: '2026-04-01', amount: '$4.99', plan: 'Silver', status: 'Paid' },
];

export default function PaymentHistory() {
  const [payments] = useState(MOCK_PAYMENTS);

  return (
    <section className="settings-section">
      <h2 className="section-title">Payment History</h2>

      {payments.length === 0 ? (
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
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.date}</td>
                <td>{payment.plan}</td>
                <td>{payment.amount}</td>
                <td>
                  <span className="status-badge status-paid">
                    {payment.status}
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
