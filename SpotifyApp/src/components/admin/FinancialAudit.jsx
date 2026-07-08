// src/pages/AdminDashboard/FinancialAudit.jsx
import { useState, useEffect } from 'react';
import styles from '../../styles/FinancialAudit.module.css';

const FinancialAudit = ({ userRole }) => {
  const [accountingData, setAccountingData] = useState([]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = () => {
    const works = JSON.parse(localStorage.getItem('artist_works') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // ساختار جدید: ذخیره تعداد استریم‌هایی که قبلاً تسویه شده‌اند
    const settlements = JSON.parse(localStorage.getItem('financial_settlements') || '{}');

    const artistStats = {};

    works.forEach(work => {
      const artistId = work.artistId || work.artist;
      if (!artistStats[artistId]) {
        const artistUser = users.find(u => u.id === artistId || u.username === artistId);
        artistStats[artistId] = {
          artistId: artistId,
          artistName: artistUser?.artistName || artistUser?.displayName || work.artistName || 'Unknown Artist',
          totalListenersSet: new Set(),
          totalStreams: 0
        };
      }

      if (work.type === 'single' || !work.type) {
        const usersArr = work.uniqueUsers || [];
        usersArr.forEach(id => artistStats[artistId].totalListenersSet.add(id));
        artistStats[artistId].totalStreams += (work.plays || 0);
      }
      
      if (work.type === 'album' && work.tracks) {
        work.tracks.forEach(t => {
           const trackUsers = t.uniqueUsers || [];
           trackUsers.forEach(id => artistStats[artistId].totalListenersSet.add(id));
           artistStats[artistId].totalStreams += (t.plays || 0);
        });
      }
    });

    const finalData = Object.values(artistStats).map(stat => {
      const pastPaidStreams = settlements[stat.artistId]?.paidStreams || 0;
      // استریم‌های جدید = کل استریم‌ها منهای استریم‌های تسویه شده قبلی
      const unpaidStreams = Math.max(0, stat.totalStreams - pastPaidStreams);
      const rewardAmount = unpaidStreams * 50; // ۵۰ ریال به ازای هر استریم

      return {
        artistId: stat.artistId,
        artistName: stat.artistName,
        totalListeners: stat.totalListenersSet.size,
        totalStreams: stat.totalStreams,
        unpaidStreams: unpaidStreams,
        amount: rewardAmount,
        status: unpaidStreams > 0 ? 'pending' : 'settled'
      };
    });

    setAccountingData(finalData);
  };

  const handleSettle = (artistId, unpaidStreams) => {
    if (window.confirm('Confirm payment for recent unpaid streams?')) {
      const settlements = JSON.parse(localStorage.getItem('financial_settlements') || '{}');
      if (!settlements[artistId]) settlements[artistId] = { paidStreams: 0 };
      
      // اضافه کردن استریم‌های جدید به لیست استریم‌های پرداخت شده
      settlements[artistId].paidStreams += unpaidStreams;
      localStorage.setItem('financial_settlements', JSON.stringify(settlements));
      
      loadFinancialData(); // رفرش درجا
    }
  };

  return (
    <div>
      <h2>Financial Audit</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Artist</th>
              <th>Total Listeners</th>
              <th>Total Streams</th>
              <th>Unpaid Streams</th>
              <th>Reward Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {accountingData.map((item) => (
              <tr key={item.artistId}>
                <td style={{ fontWeight: '600' }}>{item.artistName}</td>
                <td>{item.totalListeners.toLocaleString()}</td>
                <td>{item.totalStreams.toLocaleString()}</td>
                <td style={{ color: '#f59e0b' }}>+{item.unpaidStreams.toLocaleString()}</td>
                <td style={{ color: '#1db954', fontWeight: 'bold' }}>{item.amount.toLocaleString()} IRR</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                    {item.status === 'pending' ? 'Pending Payment' : 'Fully Settled'}
                  </span>
                </td>
                <td>
                  {userRole === 'admin' && item.amount > 0 && (
                    <button className={styles.payBtn} onClick={() => handleSettle(item.artistId, item.unpaidStreams)}>
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialAudit;