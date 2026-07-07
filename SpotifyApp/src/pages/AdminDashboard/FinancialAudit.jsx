// src/pages/AdminDashboard/FinancialAudit.jsx
import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

const FinancialAudit = ({ userRole }) => {
  const [accountingData, setAccountingData] = useState([]);

  // لود کردن و محاسبه بلادرنگ آمار از روی کارهای هنرمندان
  useEffect(() => {
    const works = JSON.parse(localStorage.getItem('artist_works') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const settlements = JSON.parse(localStorage.getItem('financial_settlements') || '{}');

    const artistStats = {};

    works.forEach(work => {
      // اگر هنرمند در آبجکت نبود، ایجادش می‌کنیم
      if (!artistStats[work.artistId]) {
        const artistUser = users.find(u => u.id === work.artistId || u.username === work.artistId);
        artistStats[work.artistId] = {
          artistId: work.artistId,
          artistName: artistUser?.artistName || artistUser?.displayName || work.artistName || 'Unknown Artist',
          uniqueListenersSet: new Set(),
          streams: 0
        };
      }

      // اضافه کردن آیدی شنوندگان به Set برای محاسبه دقیق Unique Listeners
      if (work.listenerIds && Array.isArray(work.listenerIds)) {
        work.listenerIds.forEach(id => artistStats[work.artistId].uniqueListenersSet.add(id));
      }
      
      // جمع زدن استریم‌ها
      artistStats[work.artistId].streams += (work.plays || 0);
    });

    // تبدیل آبجکت به آرایه و محاسبه درآمد نهایی (مثلاً ۵۰ ریال به ازای هر پلی)
    const finalData = Object.values(artistStats).map(stat => {
      const finalListeners = stat.uniqueListenersSet.size;
      const calculatedReward = stat.streams * 50; 
      
      return {
        artistId: stat.artistId,
        artistName: stat.artistName,
        listeners: finalListeners,
        streams: stat.streams,
        amount: calculatedReward,
        // خواندن وضعیت تسویه از استوریج، در غیر این صورت pending
        status: settlements[stat.artistId] || 'pending' 
      };
    });

    setAccountingData(finalData);
  }, []);

  const formatCurrency = (amount) => {
    return amount.toLocaleString() + ' IRR';
  };

  // تابع تسویه حساب
  const handleSettle = (artistId) => {
    if (window.confirm('Are you sure you want to mark this as paid?')) {
      // ذخیره وضعیت تسویه در LocalStorage
      const settlements = JSON.parse(localStorage.getItem('financial_settlements') || '{}');
      settlements[artistId] = 'paid';
      localStorage.setItem('financial_settlements', JSON.stringify(settlements));

      // آپدیت UI در لحظه
      setAccountingData(prev => prev.map(a => 
        a.artistId === artistId ? { ...a, status: 'paid' } : a
      ));
    }
  };

  return (
    <div>
      <h2>Financial Audit</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Artist Name</th>
              <th>Artist ID</th>
              <th>Unique Listeners</th>
              <th>Total Streams</th>
              <th>Reward Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {accountingData.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyMessage}>No financial data available.</td>
              </tr>
            ) : (
              accountingData.map((item) => (
                <tr key={item.artistId}>
                  <td style={{ fontWeight: '600' }}>{item.artistName}</td>
                  <td style={{ color: '#b3b3b3' }}>{item.artistId}</td>
                  <td>{item.listeners.toLocaleString()}</td>
                  <td>{item.streams.toLocaleString()}</td>
                  <td style={{ color: '#1db954', fontWeight: 'bold' }}>{formatCurrency(item.amount)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                      {item.status === 'pending' ? 'Pending' : 'Settled'}
                    </span>
                  </td>
                  <td>
                    {userRole === 'admin' && item.status === 'pending' && item.amount > 0 && (
                      <button 
                        className={styles.payBtn}
                        onClick={() => handleSettle(item.artistId)}
                      >
                        Confirm Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialAudit;