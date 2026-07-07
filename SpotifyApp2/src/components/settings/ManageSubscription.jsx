// src/components/settings/ManageSubscription.jsx

import { useState } from 'react';

const PLANS = [
  { id: 'basic', name: 'Basic', price: 'Free' },
  { id: 'silver', name: 'Silver', price: '$4.99/mo' },
  { id: 'gold', name: 'Gold', price: '$9.99/mo' },
];

export default function ManageSubscription({ user, updateUser }) {
  const [current, setCurrent] = useState(user.subscription || 'basic');
  const [success, setSuccess] = useState('');

  const handleChange = (planId) => {
    updateUser({ subscription: planId }); // استفاده از Context update
    setCurrent(planId);
    setSuccess(`Subscription updated to ${PLANS.find((p) => p.id === planId)?.name}.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <section className="settings-section">
      <h2 className="section-title">Manage Subscription</h2>

      <div className="subscription-plans">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${current === plan.id ? 'active' : ''}`}
          >
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>

            {current === plan.id ? (
              <span className="plan-badge">Current plan</span>
            ) : (
              <button
                className="btn-plan"
                onClick={() => handleChange(plan.id)}
              >
                Switch to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>

      {success && <p className="form-success">{success}</p>}
    </section>
  );
}
