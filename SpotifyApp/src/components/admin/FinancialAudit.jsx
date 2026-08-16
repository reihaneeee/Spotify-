// src/components/admin/FinancialAudit.jsx
import styles from '../../styles/FinancialAudit.module.css';

export default function FinancialAudit({ financials = [], loading = false, onMarkPaid, userRole }) {
  
  if (loading) {
    return <div style={{ color: '#b3b3b3', padding: '20px' }}>Loading financial data...</div>;
  }

  if (!financials || financials.length === 0) {
    return <div style={{ color: '#b3b3b3', padding: '20px' }}>No financial records found for this month.</div>;
  }

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
              <th>Reward Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {financials.map((item, idx) => {
              const artistId = item.artist || item.artist_id || item.id;
              const artistName = item.artist_name || item.artistName || `Artist #${artistId}`;
              const listeners = item.unique_listeners ?? item.uniqueListeners ?? 0;
              const streams = item.total_streams ?? item.totalStreams ?? 0;
              const reward = item.calculated_reward ?? item.calculatedReward ?? 0;
              const isSettled = item.is_settled ?? item.isSettled ?? false;

              return (
                <tr key={artistId || idx}>
                  <td style={{ fontWeight: '600' }}>{artistName}</td>
                  <td>{Number(listeners).toLocaleString()}</td>
                  <td>{Number(streams).toLocaleString()}</td>
                  <td style={{ color: '#1db954', fontWeight: 'bold' }}>{Number(reward).toLocaleString()} IRR</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[isSettled ? 'settled' : 'pending']}`}>
                      {isSettled ? 'Fully Settled' : 'Pending Payment'}
                    </span>
                  </td>
                  <td>
                    {!isSettled && onMarkPaid && (userRole === 'admin' || userRole === 'manager') && (
                      <button className={styles.payBtn} onClick={() => onMarkPaid(artistId)}>
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}