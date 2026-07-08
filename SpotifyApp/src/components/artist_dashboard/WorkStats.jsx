// src/pages/ArtistDashboard/WorkStats.jsx
import styles from '../../styles/WorkStats.module.css';
import { EarIcon, PlaysIcon, MoneyBagIcon } from '../icons';

const WorkStats = ({ works }) => {
  // ۱. خواندن اطلاعات خود هنرمند از حافظه برای دریافت پولی که ادمین واریز کرده
  const rawUser = localStorage.getItem('currentUser') || '{}';
  const currentUser = JSON.parse(rawUser);

  // ۲. محاسبه مجموع استریم‌ها
  const totalPlays = works.reduce((sum, w) => sum + (Number(w.plays) || 0), 0);

  // ۳. محاسبه شنوندگان منحصر‌به‌فرد (جلوگیری از شمارش تکراری یک شخص)
  const uniqueListenersSet = new Set();
  works.forEach(w => {
    if (w.uniqueUsers) {
      w.uniqueUsers.forEach(userId => uniqueListenersSet.add(userId));
    }
    // اگر آلبوم است، شنوندگان ترک‌ها را هم اضافه کن
    if (w.tracks) {
      w.tracks.forEach(t => {
        if (t.uniqueUsers) t.uniqueUsers.forEach(userId => uniqueListenersSet.add(userId));
      });
    }
  });
  
  // اگر دیتای uniqueUsers هنوز شکل نگرفته بود، از همون listeners پیش‌فرض استفاده کن
  const totalListeners = uniqueListenersSet.size > 0 
    ? uniqueListenersSet.size 
    : works.reduce((sum, w) => sum + (Number(w.listeners) || 0), 0);

  // ۴. خواندن مستقیم درآمد از کیف پول هنرمند
  const totalRevenue = currentUser.totalRevenue || 0;

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