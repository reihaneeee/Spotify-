// src/components/home/NotificationsPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPanel({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const role = currentUser?.role || 'listener';

  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem('spotify_notifications');
      if (stored) {
        let allNotifications = JSON.parse(stored);
        
        // Remove identical records
        const uniqueNotifications = allNotifications.filter((value, index, self) =>
          self.findIndex(n => n.id === value.id) === index
        );

        // Filter based on userType and role
        const filtered = currentUser.userType === 'admin'
          ? uniqueNotifications.filter(n => n.role === 'admin')
          : uniqueNotifications.filter(n => n.targetEmail === currentUser.email || (n.role === currentUser.userType && !n.targetEmail));
        
        setNotifications(filtered);
      } else {
        setNotifications([]);
      }
    }
  }, [currentUser]);

  const updateStorage = (updatedFilteredList) => {
    setNotifications(updatedFilteredList);
    const allStored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    
    const otherNotifications = allStored.filter(n => {
      if (currentUser.userType === 'admin') return n.role !== 'admin';
      return n.targetEmail !== currentUser.email && !(n.role === currentUser.userType && !n.targetEmail);
    });
    
    localStorage.setItem('spotify_notifications', JSON.stringify([...otherNotifications, ...updatedFilteredList]));
  };

  const handleMarkAsRead = (id, e) => {
    if (e) e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    const updatedAll = stored.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotification = (id, e) => {
    if (e) e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    const updatedAll = stored.filter(n => n.id !== id);
    localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    const updatedAll = stored.map(n => {
      if (currentUser.userType === 'admin' && n.role === 'admin') return { ...n, read: true };
      if (n.targetEmail === currentUser.email) return { ...n, read: true };
      return n;
    });
    localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (n) => {
    if (!n.read) {
      const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
      const updatedAll = stored.map(item => item.id === n.id ? { ...item, read: true } : item);
      localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    }
    if (n.link) navigate(n.link);
  };

  if (notifications.length === 0) {
    return (
      <div style={{
        padding: '30px', textAlign: 'center', color: '#b3b3b3',
        backgroundColor: '#181818', borderRadius: '8px', border: '1px dashed #333', marginBottom: '25px',
        direction: 'ltr', fontFamily: 'sans-serif'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>🔔 You have no notifications.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#181818', padding: '20px', borderRadius: '8px',
      marginBottom: '25px', direction: 'ltr', fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Notifications Center</h3>
        <button 
          onClick={handleMarkAllAsRead} 
          style={{ background: 'none', border: 'none', color: '#1db954', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          ✓ Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map(n => (
          <div 
            key={n.id} 
            onClick={() => handleNotificationClick(n)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderRadius: '6px', cursor: n.link ? 'pointer' : 'default',
              backgroundColor: n.read ? '#121212' : '#282828',
              borderLeft: n.read ? '4px solid #444' : '4px solid #1db954',
              transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!n.read && (
                <span style={{
                  width: '8px', height: '8px', backgroundColor: '#1db954',
                  borderRadius: '50%', display: 'inline-block'
                }}></span>
              )}
              <span style={{ color: n.read ? '#b3b3b3' : '#fff', fontSize: '14px' }}>
                {/* ترجمه داینامیک پیام‌های فارسی سیستم به انگلیسی روان */}
                {n.text
                  .replace('⚠️ هشدار مهلت اشتراک: مهارت اشتراک ویژه شما به اتمام رسیده است. جهت تمدید و دسترسی نامحدود به بخش اشتراک‌ها مراجعه کنید.', '⚠️ Subscription Expiry Warning: Your premium access has expired. Please renew in settings.')
                  .replace('✉️ تیکت جدید: کاربر با آیدی', '✉️ New Ticket: User [')
                  .replace('ثبت کرده است.', 'has submitted a new ticket.')
                  .replace('ثبت کرده و درخواست بررسی مدارک را دارد.', 'has registered and requested verification.')
                  .replace('قطعه جدیدی به نام', 'released a new single named')
                  .replace('منتشر کرد!', '!')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!n.read && (
                <button 
                  onClick={(e) => handleMarkAsRead(n.id, e)}
                  style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  Read
                </button>
              )}
              <button 
                onClick={(e) => handleDeleteNotification(n.id, e)}
                style={{ backgroundColor: '#282828', color: '#b3b3b3', border: '1px solid #3e3e3e', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#e91429'}
                onMouseOut={(e) => e.currentTarget.style.color = '#b3b3b3'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}