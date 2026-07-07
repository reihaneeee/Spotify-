import { useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';

export default function AdminSettings() {
  const [prices, setPrices] = useState({ silver: 50000, gold: 100000 });

  const handleUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('sub_prices', JSON.stringify(prices));
    alert('Subscription prices updated dynamically!');
  };

  return (
    <div className={styles.settingsGrid}>
      <div className={styles.card}>
        <h3>Subscription Pricing Control</h3>
        <form onSubmit={handleUpdate} className={styles.priceForm}>
          <div className={styles.formGroup}>
            <label>Silver Subscription (IRR)</label>
            <input 
              type="number" 
              value={prices.silver} 
              onChange={e => setPrices({...prices, silver: e.target.value})}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Gold Subscription (IRR)</label>
            <input 
              type="number" 
              value={prices.gold} 
              onChange={e => setPrices({...prices, gold: e.target.value})}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.btnApprove}>Update Prices</button>
        </form>
      </div>
      
      {/* بخش گرافیک‌ها و نمودارها می‌تواند در اینجا اضافه شود [cite: 180, 181] */}
    </div>
  );
}