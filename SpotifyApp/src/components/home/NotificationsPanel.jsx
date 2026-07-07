// src/components/home/NotificationsPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPanel({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const role = currentUser?.role || 'listener';

  // src/components/home/NotificationsPanel.jsx

  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem('spotify_notifications');
      if (stored) {
        let allNotifications = JSON.parse(stored);
        
        // ۱. حل ریشه‌ای مشکل کلید تکراری در فرانت‌اند: 
        // حذفِ رکوردهای کاملاً همسان که در یک میلی‌ثانیه تکرار شده‌اند قبل از رندر
        const uniqueNotifications = allNotifications.filter((value, index, self) =>
          self.findIndex(n => n.id === value.id) === index
        );

        // ۲. فیلتر اختصاصی و تفکیک‌شده:
        // ادمین فقط نوتیف‌های مربوط به نقش 'admin' را می‌بیند و بقیه کاربران نوتیف‌های خودشان را
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
    
    // نگه‌داشتن اعلان‌های مربوط به دیگران و به‌روزرسانی بخش مربوط به این کاربر
    const otherNotifications = allStored.filter(n => {
      if (currentUser.role === 'admin') return false;
      return n.targetEmail !== currentUser.email && !(n.role === role && !n.targetEmail);
    });
    
    localStorage.setItem('spotify_notifications', JSON.stringify([...otherNotifications, ...updatedFilteredList]));
  };

  // src/components/home/NotificationsPanel.jsx

  // ۱. تابع علامت‌گذاری به عنوان خوانده شده (اصلاح شده)
  const handleMarkAsRead = (id) => {
    const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    
    // آپدیت دیتای اصلی در لوکال استوریج
    const updatedAll = stored.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    
    // آپدیت آنی دیتای فیلتر شده روی صفحه
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ۲. تابع حذف یک اعلان خاص (اصلاح شده)
  const handleDeleteNotification = (id) => {
    const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    
    // حذف از دیتای اصلی لوکال استوریج
    const updatedAll = stored.filter(n => n.id !== id);
    localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    
    // حذف آنی از روی صفحه
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ۳. تابع خواندن همه اعلانات (اصلاح شده)
  const handleMarkAllAsRead = () => {
    const stored = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
    
    const updatedAll = stored.map(n => {
      if (currentUser.userType === 'admin' && n.role === 'admin') {
        return { ...n, read: true };
      }
      if (n.targetEmail === currentUser.email) {
        return { ...n, read: true };
      }
      return n;
    });
    
    localStorage.setItem('spotify_notifications', JSON.stringify(updatedAll));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  const markAsRead = (id, e) => {
    if (e) e.stopPropagation();
    updateStorage(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id, e) => {
    if (e) e.stopPropagation();
    updateStorage(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    updateStorage(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markAsRead(n.id, null);
    if (n.link) navigate(n.link); // هدایت مستقیم کاربر در صورت وجود لینک اثر یا پنل
  };

  // وضعیت خالی (Empty State) طبق سند فاز اول
  if (notifications.length === 0) {
    return (
      <div style={{
        padding: '30px', textAlign: 'center', color: '#b3b3b3',
        backgroundColor: '#181818', borderRadius: '8px', border: '1px dashed #333', marginBottom: '25px'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>🔔 هیچ اعلان جدید یا قدیمی برای شما وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#181818', padding: '20px', borderRadius: '8px',
      marginBottom: '25px', direction: 'rtl', fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>مرکز اعلانات سامانه</h3>
        <button 
          onClick={handleMarkAllAsRead} 
          style={{ background: 'none', border: 'none', color: '#1db954', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          ✓ خواندن همه اعلانات
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
              borderRight: n.read ? '4px solid #444' : '4px solid #1db954',
              transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!n.read && (
                <span style={{
                  width: '8px', height: '8px', backgroundColor: '#0070f3',
                  borderRadius: '50%', display: 'inline-block'
                }}></span>
              )}
              <span style={{ color: n.read ? '#b3b3b3' : '#fff', fontSize: '14px' }}>
                {n.text}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!n.read && (
                <button 
                  onClick={(e) => {e.stopPropagation(); handleMarkAsRead(n.id, e);}}
                  style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  خواندم
                </button>
              )}
              <button 
                onClick={(e) => {e.stopPropagation(); handleDeleteNotification(n.id, e);}}
                style={{ backgroundColor: '#e91429', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}