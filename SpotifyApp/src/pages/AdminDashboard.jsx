// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../components/home/Sidebar';
import { Check, X, Users } from 'lucide-react';
import NotificationsPanel from '../components/home/NotificationsPanel';
import { getCurrentUser } from '../utils/auth'; 
import { triggerArtistStatusNotification } from '../utils/notificationEngine'; 

import styles from '../styles/AdminDashboard.module.css';
import { useAuth } from '../context/AuthContext';
import AdminTickets from '../components/admin/AdminTickets';
import AdminAccounting from '../components/admin/AdminAccounting';
import AdminSettings from '../components/admin/AdminSettings';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [pendingArtists, setPendingArtists] = useState([]);
  
  // دسترسی‌ها: پشتیبان فقط تیکت‌ها را می‌بیند. مدیر همه چیز را.
  const isManager = user?.role === 'manager';

  // خواندن لیست هنرمندان در انتظار تایید از LocalStorage (کدهای شما)
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pending = users.filter(u => u.userType === 'artist' && u.status === 'pending');
    setPendingArtists(pending);
  }, []);

  // تابع مدیریت تایید یا رد هنرمند (کدهای شما)
  const handleAction = (username, action) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let rejectionReason = "";
    
    if (action === 'reject') {
      rejectionReason = prompt("لطفاً علت رد درخواست احراز هویت این هنرمند را وارد کنید:") || "";
    }

    const targetArtist = users.find(u => u.username === username);

    const updatedUsers = users.map(u => {
      if (u.username === username) {
        return { 
          ...u, 
          status: action === 'approve' ? 'approved' : 'rejected',
          isVerified: action === 'approve' ? true : false 
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    if (targetArtist && targetArtist.email) {
      const isAccepted = action === 'approve';
      triggerArtistStatusNotification(targetArtist.email, isAccepted, rejectionReason);
    }

    setPendingArtists(pendingArtists.filter(u => u.username !== username));
  };

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
          {activeTab === 'tickets' && (
            <div>
              {/* بخش تایید هنرمندان شما در بالای تب تیکت‌ها نشان داده می‌شود */}
              {pendingArtists.length > 0 && (
                <div style={{ marginBottom: '30px', backgroundColor: '#181818', padding: '20px', borderRadius: '8px', direction: 'rtl' }}>
                  <h3 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} /> درخواست‌های احراز هویت هنرمندان ({pendingArtists.length})
                  </h3>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {pendingArtists.map(artist => (
                      <div key={artist.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#282828', padding: '12px', borderRadius: '6px' }}>
                        <div>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{artist.displayName || artist.username}</span>
                          <span style={{ color: '#aaa', fontSize: '12px', marginRight: '10px' }}>({artist.email})</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleAction(artist.username, 'approve')} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={16} /> تایید
                          </button>
                          <button onClick={() => handleAction(artist.username, 'reject')} style={{ backgroundColor: '#e91429', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <X size={16} /> رد درخواست
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* کامپوننت پیش‌فرض تیکت‌های پارت ۱۰ و ۱۱ */}
              <AdminTickets />
            </div>
          )}
          
          {activeTab === 'accounting' && isManager && <AdminAccounting />}
          {activeTab === 'settings' && isManager && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}