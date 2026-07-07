// src/pages/AdminDashboard/AdminDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext'; // 👈 اتصال به دیتای واقعی
import Sidebar from '../../components/home/Sidebar'; 
import styles from './AdminDashboard.module.css';
import TicketsSection from './TicketsSection';
import ArtistApproval from './ArtistApproval';
import FinancialAudit from './FinancialAudit';
import SubscriptionControl from './SubscriptionControl';
import { MusicIcon } from '../../components/icons';

const AdminDashboard = () => {
  const { user } = useAuth() || {};
  
  // 👈 خواندن اطلاعات واقعی به جای دیتای تستی
  const { 
    users = [], 
    tickets = [], 
    financials = [], 
    updateUser = () => {}, 
    addReplyToTicket = () => {}, 
    setFinancials = () => {} 
  } = useData() || {};

  const [activeTab, setActiveTab] = useState('tickets');
  const userRole = user?.role || user?.userType || 'support';

  // تایید هنرمند در دیتابیس واقعی
  const approveArtist = (id) => {
    updateUser(id, { status: 'approved' });
    alert(`Artist approved successfully! They can now login.`);
  };

  // رد هنرمند در دیتابیس واقعی
  const rejectArtist = (id, reason) => {
    updateUser(id, { status: 'rejected', rejectReason: reason });
    alert(`Artist rejected. Reason: ${reason}`);
  };

  const markFinancialAsPaid = (artistId) => {
    setFinancials(prev => prev.map(f => 
      f.artistId === artistId ? { ...f, status: 'paid' } : f
    ));
  };

  // فیلتر کردن هنرمندان در انتظار از بین کل کاربران
  // (هرکسی که نقشش artist باشه و هنوز تایید نشده باشه)
  const pendingArtists = users.filter(u => 
    (u.role === 'artist' || u.userType === 'artist') && u.status === 'pending'
  );

  return (
    <div className="home-layout">
      <Sidebar /> 

      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>
            <MusicIcon size={32} color="#1db954" className={styles.headerIcon} />
            Management Panel
          </h1>
          <div className={styles.userInfo}>
            <span>Role: {userRole === 'admin' ? 'System Admin' : 'Support Staff'}</span>
          </div>
        </div>

        <div className={styles.dashboardLayout}>
          <div className={styles.sidebar}>
            <button 
              className={`${styles.sidebarItem} ${activeTab === 'tickets' ? styles.active : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Tickets ({tickets.filter(t=> t.status === 'open').length})
            </button>
            <button 
              className={`${styles.sidebarItem} ${activeTab === 'approval' ? styles.active : ''}`}
              onClick={() => setActiveTab('approval')}
            >
              Artist Approval ({pendingArtists.length})
            </button>
            
            {userRole === 'admin' && (
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
            {activeTab === 'tickets' && (
               // پاس دادن تیکت‌های واقعی
              <TicketsSection tickets={tickets} onReply={addReplyToTicket} />
            )}
            {activeTab === 'approval' && (
               // پاس دادن درخواست‌های واقعی هنرمندان
              <ArtistApproval 
                artists={pendingArtists}
                onApprove={approveArtist} 
                onReject={rejectArtist} 
              />
            )}
            {activeTab === 'financial' && userRole === 'admin' && (
              <FinancialAudit 
                financials={financials} 
                onMarkPaid={markFinancialAsPaid}
                userRole={userRole}
              />
            )}
            {activeTab === 'subscription' && userRole === 'admin' && (
              <SubscriptionControl />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;