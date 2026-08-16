import styles from '../../styles/WorkStats.module.css';
import { EarIcon, PlaysIcon, MoneyBagIcon } from '../icons';
import { useState, useEffect } from 'react';
import { fetchArtistReports, fetchArtistOverview } from '../../services/reportApi';

const WorkStats = () => {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [stats, setStats] = useState({ total_streams: 0, unique_listeners: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        // ۱. دریافت درآمد از گزارش‌ها
        const reports = await fetchArtistReports();
        let sumRevenue = 0;
        const list = Array.isArray(reports) 
          ? reports 
          : (reports && Array.isArray(reports.results) ? reports.results : []);

        list.forEach(r => {
          sumRevenue += Number(r.calculated_reward || 0);
        });
        setTotalRevenue(sumRevenue);

        // ۲. دریافت آمار لحظه‌ای کاتالوگ با مدیریت توکن و URL از طریق apiClient
        const overviewData = await fetchArtistOverview();
        if (overviewData) {
          setStats({
            total_streams: overviewData.total_streams || 0,
            unique_listeners: overviewData.unique_listeners || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load artist stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <p style={{ color: '#b3b3b3' }}>Loading stats...</p>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.iconWrapper}><EarIcon size={28} color="var(--primary-accent)" /></div>
            <div className={styles.statInfo}>
              <div className={styles.number}>{stats.unique_listeners.toLocaleString()}</div>
              <div className={styles.label}>Unique Listeners</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.iconWrapper}><PlaysIcon size={28} color="#2f88ff" /></div>
            <div className={styles.statInfo}>
              <div className={styles.number}>{stats.total_streams.toLocaleString()}</div>
              <div className={styles.label}>Total Streams</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.iconWrapper}><MoneyBagIcon size={28} color="#f5a623" /></div>
            <div className={styles.statInfo}>
              <div className={styles.number}>{totalRevenue.toLocaleString()}</div>
              <div className={styles.label}>Total Revenue (IRR)</div>
            </div>
          </div>
        </div>
      )}
      <p className={styles.disclaimer}>* Unique listeners & streams are updated in real-time.</p>
    </div>
  );
};

export default WorkStats;