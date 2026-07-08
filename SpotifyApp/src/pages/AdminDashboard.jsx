// src/pages/AdminDashboard/AdminDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Sidebar from '../components/home/Sidebar';
import styles from '../styles/AdminDashboard.module.css';
import SupportAndApproval from '../components/admin/SupportAndApproval';
import FinancialAudit from '../components/admin/FinancialAudit';
import SubscriptionControl from '../components/admin/SubscriptionControl';
import { MusicIcon } from '../components/icons';
import { triggerArtistStatusNotification } from '../utils/notificationEngine';

const AdminDashboard = () => {
  const { user } = useAuth() || {};
  const { users = [], tickets = [], financials = [], updateUser = () => {}, addReplyToTicket = () => {}, setFinancials = () => {} } = useData() || {};
  const [activeTab, setActiveTab] = useState('support'); // 'support' | 'financial' | 'subscription'

  const isManager = user?.role === 'admin' || user?.role === 'manager';
  const userRole = isManager ? 'admin' : 'support';

  const approveArtist = (id) => {
    const artist = users.find(u => u.id === id || u.username === id);
    updateUser(id, { status: 'approved', isVerified: true });
    triggerArtistStatusNotification(artist?.email, true);
    alert(`Artist approved successfully!`);
  };

  const rejectArtist = (id, reason) => {
    const artist = users.find(u => u.id === id || u.username === id);
    updateUser(id, { status: 'rejected', rejectReason: reason });
    triggerArtistStatusNotification(artist?.email, false, reason);
    alert(`Artist rejected.`);
  };

  const markFinancialAsPaid = (artistId) => {
    setFinancials(prev => prev.map(f => f.artistId === artistId ? { ...f, status: 'paid' } : f));
  };

  const pendingArtists = users.filter(u => (u.role === 'artist' || u.userType === 'artist') && u.status === 'pending');

  return (
    <div className="home-layout">
      <Sidebar />
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1><MusicIcon size={32} color="#1db954" className={styles.headerIcon} /> Management Panel</h1>
          <div className={styles.userInfo}>
            <span>Role: {isManager ? 'System Admin' : 'Support Staff'}</span>
          </div>
        </div>

        <div className={styles.dashboardLayout}>
          <div className={styles.sidebar}>
            {/* یک آیتم واحد برای Support & Approval */}
            <button
              className={`${styles.sidebarItem} ${activeTab === 'support' ? styles.active : ''}`}
              onClick={() => setActiveTab('support')}
            >
              Support &amp; Approval
              <span style={{ marginLeft: 'auto', background: '#777777ff', padding: '0.1rem 0.6rem', borderRadius: '500px', fontSize: '0.7rem' , margin: '0.3rem'}}>
                {tickets.filter(t => t.status === 'open').length + pendingArtists.length}
              </span>
            </button>

            {isManager && (
              <>
                <button
                  className={`${styles.sidebarItem} ${activeTab === 'financial' ? styles.active : ''}`}
                  onClick={() => setActiveTab('financial')}
                >
                  Financial Audit
                </button>
                <button
                  className={`${styles.sidebarItem} ${activeTab === 'subscription' ? styles.active : ''}`}
                  onClick={() => setActiveTab('subscription')}
                >
                  Subscription Control
                </button>
              </>
            )}
          </div>

          <div className={styles.content}>
            {activeTab === 'support' && (
              <SupportAndApproval
                tickets={tickets}
                pendingArtists={pendingArtists}
                onReply={addReplyToTicket}
                onApprove={approveArtist}
                onReject={rejectArtist}
              />
            )}
            {activeTab === 'financial' && isManager && (
              <FinancialAudit financials={financials} onMarkPaid={markFinancialAsPaid} userRole={userRole} />
            )}
            {activeTab === 'subscription' && isManager && (
              <SubscriptionControl />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;