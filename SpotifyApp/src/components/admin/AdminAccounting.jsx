import { useState, useEffect } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { CheckCircle } from 'lucide-react';

export default function AdminAccounting() {
  const [accountingData, setAccountingData] = useState([]);

  useEffect(() => {
    const works = JSON.parse(localStorage.getItem('artist_works') || '[]');
    
    const artistStats = {};
    works.forEach(work => {
      if (!artistStats[work.artistId]) {
        artistStats[work.artistId] = { id: work.artistId, listeners: 0, streams: 0, revenue: 0, status: 'Pending' };
      }
      artistStats[work.artistId].listeners += (work.listeners || 0);
      artistStats[work.artistId].streams += (work.plays || 0);
      artistStats[work.artistId].revenue += (work.revenue || 0);
    });

    setAccountingData(Object.values(artistStats));
  }, []);

  const handleSettle = (artistId) => {
    // در فاز دوم این درخواست به سمت بک‌اند می‌رود
    setAccountingData(prev => prev.map(a => a.id === artistId ? { ...a, status: 'Settled' } : a));
  };

  return (
    <div className={styles.card}>
      <h3>Monthly Financial Accounting</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Artist ID</th>
            <th>Unique Listeners</th>
            <th>Total Streams</th>
            <th>Calculated Reward (IRR)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accountingData.map(stat => (
            <tr key={stat.id}>
              <td>{stat.id}</td>
              <td>{stat.listeners.toLocaleString()}</td>
              <td>{stat.streams.toLocaleString()}</td>
              <td style={{ color: '#1db954' }}>{stat.revenue.toLocaleString()}</td>
              <td>
                <span className={stat.status === 'Settled' ? styles.badgeSuccess : styles.badgeWarning}>
                  {stat.status}
                </span>
              </td>
              <td>
                {stat.status !== 'Settled' && (
                  <button onClick={() => handleSettle(stat.id)} className={styles.btnApprove}>
                    <CheckCircle size={16} /> Settle
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}