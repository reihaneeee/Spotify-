// src/pages/AdminDashboard/FinancialAudit.jsx
import styles from './AdminDashboard.module.css';

const FinancialAudit = ({ financials, onMarkPaid, userRole }) => {
  return (
    <div>
      <h2>Financial Audit</h2>
      {financials.length === 0 ? (
        <p className={styles.emptyMessage}>No financial records.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artist</th>
                <th>ID</th>
                <th>Listeners</th>
                <th>Streams</th>
                <th>Amount (IRR)</th>
                <th>Status</th>
                {userRole === 'admin' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {financials.map((row) => (
                <tr key={row.artistId}>
                  <td>{row.artistName}</td>
                  <td>{row.artistId}</td>
                  <td>{row.listeners}</td>
                  <td>{row.streams}</td>
                  <td>{row.amount.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[row.status]}`}>
                      {row.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  {userRole === 'admin' && (
                    <td>
                      {row.status === 'pending' && (
                        <button 
                          className={styles.payBtn}
                          onClick={() => onMarkPaid(row.artistId)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinancialAudit;