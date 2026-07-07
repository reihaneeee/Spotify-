import { useState } from 'react';
import Sidebar from '../components/home/Sidebar';
import styles from '../styles/AdminDashboard.module.css';
import { useAuth } from '../context/AuthContext';
import AdminTickets from '../components/admin/AdminTickets';
import AdminAccounting from '../components/admin/AdminAccounting';
import AdminSettings from '../components/admin/AdminSettings';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  
  // دسترسی‌ها: پشتیبان فقط تیکت‌ها را می‌بیند. مدیر همه چیز را.
  const isManager = user?.role === 'manager'; // فرض بر این است که نقش مدیر manager و پشتیبان support است

  return (
    <div className="home-layout">
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>System Administration</h1>
          <p className={styles.subtitle}>
            {isManager ? 'Full access to management and financial tools.' : 'Support panel for tickets and approvals.'}
          </p>
        </header>

        <nav className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'tickets' ? styles.active : ''}`} 
            onClick={() => setActiveTab('tickets')}
          >
            Tickets & Approvals
          </button>
          
          {isManager && (
            <>
              <button 
                className={`${styles.tab} ${activeTab === 'accounting' ? styles.active : ''}`} 
                onClick={() => setActiveTab('accounting')}
              >
                Accounting
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`} 
                onClick={() => setActiveTab('settings')}
              >
                System Settings
              </button>
            </>
          )}
        </nav>

        <div className={styles.contentArea}>
          {activeTab === 'tickets' && <AdminTickets />}
          {activeTab === 'accounting' && isManager && <AdminAccounting />}
          {activeTab === 'settings' && isManager && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}