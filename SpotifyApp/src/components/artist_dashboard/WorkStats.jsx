// src/pages/ArtistDashboard/WorkStats.jsx
import styles from '../../styles/WorkStats.module.css';
import { EarIcon, PlaysIcon, MoneyBagIcon } from '../icons';

const WorkStats = ({ works }) => {
  const totalPlays = works.reduce((sum, w) => sum + (Number(w.plays) || 0), 0);
  const totalListeners = works.reduce((sum, w) => sum + (Number(w.listeners) || 0), 0);
  const totalRevenue = works.reduce((sum, w) => sum + (Number(w.revenue) || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <EarIcon size={28} color="var(--primary-accent)" />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.number}>{totalListeners.toLocaleString()}</div>
            <div className={styles.label}>Unique Listeners</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <PlaysIcon size={28} color="#2f88ff" />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.number}>{totalPlays.toLocaleString()}</div>
            <div className={styles.label}>Total Streams</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <MoneyBagIcon size={28} color="#f5a623" />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.number}>{totalRevenue.toLocaleString()}</div>
            <div className={styles.label}>Total Revenue (IRR)</div>
          </div>
        </div>
      </div>
      <p className={styles.disclaimer}>
        * Stats are calculated based on current local data.
      </p>
    </div>
  );
};

export default WorkStats;