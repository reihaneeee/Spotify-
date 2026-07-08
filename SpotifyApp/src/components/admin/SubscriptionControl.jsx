// src/pages/AdminDashboard/SubscriptionControl.jsx
import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import styles from '../../styles/SubscriptionControl.module.css';

const SubscriptionControl = () => {
  const { users } = useData();
  
  const [silverPrice, setSilverPrice] = useState(() => localStorage.getItem('sub_silver') || '150000');
  const [goldPrice, setGoldPrice] = useState(() => localStorage.getItem('sub_gold') || '300000');
  
  const [stats, setStats] = useState({ base: 0, silver: 0, gold: 0, totalRevenue: 0 });

  useEffect(() => {
    // محاسبه واقعی آمار کاربران
    let baseCount = 0; let silverCount = 0; let goldCount = 0;
    
    users.forEach(u => {
      if (u.role === 'user' || u.userType === 'listener') {
        if (u.subscription === 'gold') goldCount++;
        else if (u.subscription === 'silver') silverCount++;
        else baseCount++;
      }
    });

    const totalRev = (silverCount * parseInt(silverPrice)) + (goldCount * parseInt(goldPrice));
    setStats({ base: baseCount, silver: silverCount, gold: goldCount, totalRevenue: totalRev });
  }, [users, silverPrice, goldPrice]);

  const handleUpdate = () => {
    localStorage.setItem('sub_silver', silverPrice);
    localStorage.setItem('sub_gold', goldPrice);
    alert('Prices updated dynamically! New rates are now active across the system.');
  };

  // محاسبه درصدها برای رسم نمودار دایره‌ای با CSS
  const totalUsers = stats.base + stats.silver + stats.gold;
  const goldPct = totalUsers ? (stats.gold / totalUsers) * 100 : 0;
  const silverPct = totalUsers ? (stats.silver / totalUsers) * 100 : 0;
  const basePct = totalUsers ? (stats.base / totalUsers) * 100 : 0;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Subscription & Financial Control</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* پنل تغییر قیمت */}
        <div className={styles.pricePanel} style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1db954' }}>Dynamic Pricing Control</h3>
          <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#b3b3b3', marginBottom: '0.5rem' }}>Silver Price (IRR)</label>
            <input type="number" value={silverPrice} onChange={(e) => setSilverPrice(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#b3b3b3', marginBottom: '0.5rem' }}>Gold Price (IRR)</label>
            <input type="number" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <button onClick={handleUpdate} style={{ background: '#1db954', color: '#000', border: 'none', padding: '0.75rem 2rem', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer' }}>
            Apply New Prices
          </button>
        </div>

        {/* پنل گزارش‌های مالی و نمودار */}
        <div style={{ flex: '2', minWidth: '400px', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.statCard} style={{ flex: '1', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>Estimated Monthly Revenue</div>
              <div style={{ color: '#1db954', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats.totalRevenue.toLocaleString()} IRR</div>
            </div>
            <div className={styles.statCard} style={{ flex: '1', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>Total Active Subscriptions</div>
              <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats.silver + stats.gold} Users</div>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* نمودار دایره‌ای با CSS */}
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: `conic-gradient(#1db954 0% ${goldPct}%, #c0c0c0 ${goldPct}% ${goldPct + silverPct}%, #333 ${goldPct + silverPct}% 100%)`
            }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>User Distribution</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#1db954', borderRadius: '50%' }}></span>
                <span>Gold: {stats.gold} ({goldPct.toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#c0c0c0', borderRadius: '50%' }}></span>
                <span>Silver: {stats.silver} ({silverPct.toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#333', borderRadius: '50%' }}></span>
                <span>Base (Free): {stats.base} ({basePct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionControl;