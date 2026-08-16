import { useState, useEffect } from 'react';
import styles from '../../styles/SubscriptionControl.module.css';
import { fetchAdminPricing, updateAdminPricing } from '../../services/reportApi';

export default function SubscriptionControl({ stats, onUpdatePrices }) {
  const [silverPrice, setSilverPrice] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // ۱. دریافت قیمت‌های فعلی از بک‌اند هنگام بارگذاری صفحه
  useEffect(() => {
    const fetchCurrentPrices = async () => {
      try {
        const data = await fetchAdminPricing();
        setSilverPrice(data.silver_price ?? '');
        setGoldPrice(data.gold_price ?? '');
      } catch (error) {
        console.error('خطا در دریافت قیمت‌های فعلی:', error);
      }
    };

    fetchCurrentPrices();
  }, []);

  // ۲. ارسال قیمت‌های جدید به بک‌اند
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateAdminPricing(silverPrice, goldPrice);

      if (onUpdatePrices) {
        onUpdatePrices(silverPrice, goldPrice);
      }

      alert('قیمت‌ها با موفقیت در بک‌اند به‌روزرسانی شدند!');
    } catch (error) {
      console.error('خطا در به‌روزرسانی قیمت‌ها:', error);
      alert('خطا در ثبت قیمت جدید در بک‌اند.');
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = (stats?.basic_users || 0) + (stats?.silver_users || 0) + (stats?.gold_users || 0);
  const goldPct = totalUsers ? (stats.gold_users / totalUsers) * 100 : 0;
  const silverPct = totalUsers ? (stats.silver_users / totalUsers) * 100 : 0;
  const basePct = totalUsers ? (stats.basic_users / totalUsers) * 100 : 0;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Subscription & Financial Control</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className={styles.pricePanel} style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1db954' }}>Dynamic Pricing Control</h3>
          <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#b3b3b3', marginBottom: '0.5rem' }}>Silver Price (IRR)</label>
            <input 
              type="number" 
              value={silverPrice} 
              onChange={(e) => setSilverPrice(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#b3b3b3', marginBottom: '0.5rem' }}>Gold Price (IRR)</label>
            <input 
              type="number" 
              value={goldPrice} 
              onChange={(e) => setGoldPrice(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <button 
            onClick={handleUpdate} 
            disabled={loading}
            style={{ background: '#1db954', color: '#000', border: 'none', padding: '0.75rem 2rem', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Updating...' : 'Apply New Prices'}
          </button>
        </div>

        <div style={{ flex: '2', minWidth: '400px', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.statCard} style={{ flex: '1', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>Estimated Monthly Revenue</div>
              <div style={{ color: '#1db954', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{Number(stats?.revenue_this_month || 0).toLocaleString()} IRR</div>
            </div>
            <div className={styles.statCard} style={{ flex: '1', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>Total Active Subscriptions</div>
              <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{(stats?.silver_users || 0) + (stats?.gold_users || 0)} Users</div>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: `conic-gradient(#1db954 0% ${goldPct}%, #c0c0c0 ${goldPct}% ${goldPct + silverPct}%, #333 ${goldPct + silverPct}% 100%)`
            }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>User Distribution</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#1db954', borderRadius: '50%' }}></span>
                <span>Gold: {stats?.gold_users || 0} ({goldPct.toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#c0c0c0', borderRadius: '50%' }}></span>
                <span>Silver: {stats?.silver_users || 0} ({silverPct.toFixed(1)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: '#333', borderRadius: '50%' }}></span>
                <span>Base (Free): {stats?.basic_users || 0} ({basePct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}