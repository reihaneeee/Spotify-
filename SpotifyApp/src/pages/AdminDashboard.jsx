// src/pages/AdminDashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/home/Sidebar';
import styles from '../styles/AdminDashboard.module.css';
import SupportAndApproval from '../components/admin/SupportAndApproval';
import FinancialAudit from '../components/admin/FinancialAudit';
import SubscriptionControl from '../components/admin/SubscriptionControl';
import { MusicIcon } from '../components/icons';
import { triggerArtistStatusNotification } from '../utils/notificationEngine';

import { fetchAdminStats, fetchAdminReports, settleArtist, fetchPendingArtists, updateArtistStatus } from '../services/reportApi';
import { fetchTickets, replyTicket, closeTicketApi } from '../services/ticketApi';

const AdminDashboard = () => {
  const { user } = useAuth() || {};
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('support');
  const [stats, setStats] = useState({ basic_users: 0, silver_users: 0, gold_users: 0, revenue_this_month: 0 });
  const [financialReports, setFinancialReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [pendingArtists, setPendingArtists] = useState([]);

  // بررسی دقیق‌تر و انعطاف‌پذیرتر نقش ادمین
  const isManager = Boolean(
    user?.is_staff || 
    user?.is_superuser || 
    user?.role?.toLowerCase() === 'admin' || 
    user?.role?.toLowerCase() === 'manager'
  );
  const userRole = isManager ? 'admin' : 'support';

  const loadBackendTickets = async () => {
    try {
      const data = await fetchTickets();
      setTickets(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error("Failed to load tickets in admin dashboard", err);
    }
  };

  const loadPendingArtists = async () => {
    try {
      const list = await fetchPendingArtists();
      setPendingArtists(Array.isArray(list) ? list : (list?.results || []));
    } catch (err) {
      console.error("Failed to load pending artists from backend", err);
    }
  };

  useEffect(() => {
    loadPendingArtists();
    loadBackendTickets();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        if (data) {
          setStats({
            basic_users: data.basic_users ?? data.basicUsers ?? 0,
            silver_users: data.silver_users ?? data.silverUsers ?? 0,
            gold_users: data.gold_users ?? data.goldUsers ?? 0,
            revenue_this_month: data.revenue_this_month ?? data.revenueThisMonth ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    if (isManager) loadStats();
  }, [isManager]);

  const handleAdminReply = async (ticketId, text) => {
    try {
      await replyTicket(ticketId, text);
      loadBackendTickets();
    } catch (err) {
      console.error(err);
      alert('Error sending reply');
    }
  };

  const handleAdminCloseTicket = async (ticketId) => {
    try {
      await closeTicketApi(ticketId);
      loadBackendTickets();
    } catch (err) {
      console.error(err);
      alert('Error closing ticket');
    }
  };

  const loadFinancialReports = async () => {
    if (!isManager) return;
    setLoadingReports(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const reports = await fetchAdminReports(year, month);
      
      // حل مشکل اصلی: پشتیبانی هم‌زمان از Response آرایه‌ای و Response دارای results
      const reportList = Array.isArray(reports) ? reports : (reports?.results || []);
      setFinancialReports(reportList);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'financial' && isManager) {
      loadFinancialReports();
    }
  }, [activeTab, isManager]);

  const handleSettle = async (artistId) => {
    if (!window.confirm('Are you sure you want to settle this payment?')) return;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      await settleArtist(artistId, year, month);
      alert('Settled successfully!');
      loadFinancialReports();
    } catch (err) {
      console.error(err);
      alert('Error settling payment.');
    }
  };

  const handleUpdatePrices = async (silverPrice, goldPrice) => {
    alert(`Subscription prices set to: Silver=${silverPrice} IRR, Gold=${goldPrice} IRR`);
  };

  const approveArtist = async (id) => {
    try {
      await updateArtistStatus(id, { artist_status: 'approved', is_verified: true, is_approved: true });
      const artist = pendingArtists.find(u => u.id === id);
      triggerArtistStatusNotification(artist?.email, true);
      alert(`Artist approved successfully!`);
      loadPendingArtists();
    } catch (err) {
      console.error(err);
      alert('Error approving artist.');
    }
  };

  const rejectArtist = async (id, reason) => {
    try {
      await updateArtistStatus(id, { artist_status: 'rejected', artist_rejection_reason: reason});
      const artist = pendingArtists.find(u => u.id === id);
      triggerArtistStatusNotification(artist?.email, false, reason);
      alert(`Artist rejected.`);
      loadPendingArtists();
    } catch (err) {
      console.error(err);
      alert('Error rejecting artist.');
    }
  };

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
                <button className={`${styles.sidebarItem} ${activeTab === 'financial' ? styles.active : ''}`} onClick={() => setActiveTab('financial')}>
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
                onReply={handleAdminReply}
                onCloseTicket={handleAdminCloseTicket}
                onApprove={approveArtist}
                onReject={rejectArtist}
              />
            )}
            {activeTab === 'financial' && isManager && (
              <FinancialAudit 
                financials={financialReports} 
                onMarkPaid={handleSettle} 
                userRole={userRole}
                loading={loadingReports}
              />
            )}
            {activeTab === 'subscription' && isManager && (
              <SubscriptionControl stats={stats} onUpdatePrices={handleUpdatePrices} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;