// src/pages/AdminDashboard/SubscriptionControl.jsx
import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

const SubscriptionControl = () => {
  const [silverPrice, setSilverPrice] = useState(() => {
    return localStorage.getItem('sub_silver') || '150000';
  });
  const [goldPrice, setGoldPrice] = useState(() => {
    return localStorage.getItem('sub_gold') || '300000';
  });

  const handleUpdate = () => {
    localStorage.setItem('sub_silver', silverPrice);
    localStorage.setItem('sub_gold', goldPrice);
    alert('Prices updated successfully!');
  };

  return (
    <div>
      <h2>Subscription Control</h2>
      <div className={styles.subscriptionForm}>
        <div className={styles.formGroup}>
          <label>Silver Subscription Price (IRR)</label>
          <input
            type="number"
            value={silverPrice}
            onChange={(e) => setSilverPrice(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Gold Subscription Price (IRR)</label>
          <input
            type="number"
            value={goldPrice}
            onChange={(e) => setGoldPrice(e.target.value)}
          />
        </div>
        <button onClick={handleUpdate} className={styles.updateBtn}>
          Update Prices
        </button>
      </div>
    </div>
  );
};

export default SubscriptionControl;