// src/components/home/NotificationsPanel.jsx
//
// Phase-1 part 2.6 synced to the phase-2 backend: notifications are now
// created server-side (accounts/signals.py on artist approval, catalog/signals.py
// on new release) and this panel just reads/mutates them through
// notificationApi.js instead of the 'spotify_notifications' localStorage array.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayback } from '../../context/PlaybackContext';
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/notificationApi';

export default function NotificationsPanel({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { playSong } = usePlayback();

  const load = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchMyNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await markNotificationRead(id);
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsRead();
  };

  const handleNotificationClick = async (n, e) => {
    if (e) e.stopPropagation();

    if (!n.is_read) {
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item)));
      markNotificationRead(n.id);
    }

    if (n.work_type === 'single' && n.work_data) {
      playSong(
        {
          id: n.work_data.id,
          title: n.work_data.title,
          artist: n.work_data.artist_name,
          itemType: 'song',
        },
        []
      );
      return;
    }

    if (n.work_type === 'album') {
      window.dispatchEvent(new CustomEvent('globalSelectAlbum', { detail: n.work_data }));
      navigate('/albums');
      return;
    }

    if (n.link) navigate(n.link);
  };

  if (loading) return null;

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
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderRadius: '6px', cursor: n.link ? 'pointer' : 'default',
              backgroundColor: n.is_read ? '#121212' : '#282828',
              borderLeft: n.is_read ? '4px solid #444' : '4px solid #1db954',
              transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!n.is_read && (
                <span style={{
                  width: '8px', height: '8px', backgroundColor: '#1db954',
                  borderRadius: '50%', display: 'inline-block'
                }}></span>
              )}
              <span style={{ color: n.is_read ? '#b3b3b3' : '#fff', fontSize: '14px' }}>{n.text}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {n.work_data && (
                <button
                  onClick={(e) => handleNotificationClick(n, e)}
                  title={n.work_type === 'album' ? 'View Album' : 'Play Song'}
                  style={{
                    backgroundColor: '#1db954', color: '#000', border: 'none', width: '32px',
                    height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                    fontWeight: 'bold', padding: 0, transition: 'transform 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {n.work_type === 'album' ? '💿' : '▶'}
                </button>
              )}

              {!n.is_read && (
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
                onMouseOver={(e) => (e.currentTarget.style.color = '#e91429')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#b3b3b3')}
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
