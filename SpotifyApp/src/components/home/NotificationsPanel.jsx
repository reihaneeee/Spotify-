// src/components/home/NotificationsPanel.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/home.css';

export default function NotificationsPanel({ currentUser }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('spotify_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      const defaultMocks = [
        { id: 1, role: 'listener', subType: 'all', text: 'مهلت اشتراک شما رو به اتمام است.', read: false },
        { id: 2, role: 'listener', subType: 'all', text: 'هنرمند مورد علاقه شما آلبوم جدیدی منتشر کرد.', read: true },
        { id: 3, role: 'artist', subType: 'all', text: 'حساب کاربری هنرمند شما تایید شد.', read: false },
        { id: 4, role: 'support', subType: 'all', text: 'تیکت پشتیبانی جدیدی ثبت شده است.', read: false }
      ];
      
      const role = currentUser?.role || 'listener';
      const filtered = defaultMocks.filter(n => n.role === role || role === 'admin');
      setNotifications(filtered);
      localStorage.setItem('spotify_notifications', JSON.stringify(filtered));
    }
  }, [currentUser]);

  const updateStorage = (updated) => {
    setNotifications(updated);
    localStorage.setItem('spotify_notifications', JSON.stringify(updated));
  };

  const markAsRead = (id) => {
    updateStorage(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    updateStorage(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    updateStorage(notifications.map(n => ({ ...n, read: true })));
  };

  if (notifications.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
        <p>هیچ اعلانی یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="notifications-container" style={{ padding: '20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>پنل اعلانات سامانه</h3>
        <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#1db954', cursor: 'pointer' }}>
          خواندن همه اعلانات
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px', backgroundColor: n.read ? '#181818' : '#282828',
            borderRadius: '6px', borderRight: n.read ? 'none' : '4px solid #1db954'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!n.read && <span style={{ width: '8px', height: '8px', backgroundColor: '#1db954', borderRadius: '50%' }}></span>}
              <span>{n.text}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!n.read && <button onClick={() => markAsRead(n.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>خواندم</button>}
              <button onClick={() => deleteNotification(n.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: '#e91429', color: '#fff', cursor: 'pointer' }}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}