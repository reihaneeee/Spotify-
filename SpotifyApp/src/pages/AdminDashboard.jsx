import { useState, useEffect } from 'react';
import Sidebar from '../components/home/Sidebar';
import { Check, X, Users } from 'lucide-react';
import NotificationsPanel from '../components/home/NotificationsPanel';
import { getCurrentUser } from '../utils/auth'; // یا هر متدی که کاربر فعلی (ادمین) را می‌گیرد

import { triggerArtistStatusNotification } from '../utils/notificationEngine'; // اسم جدید و درست

export default function AdminDashboard() {
  const [pendingArtists, setPendingArtists] = useState([]);

  // خواندن لیست هنرمندان در انتظار تایید از LocalStorage
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pending = users.filter(u => u.userType === 'artist' && u.status === 'pending');
    setPendingArtists(pending);
  }, []);

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
      <main style={{ flex: 1, padding: '40px', background: '#121212', color: '#fff' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Admin Dashboard</h1>
        <p style={{ color: '#b3b3b3', marginBottom: '32px' }}>Manage artist applications and verifications.</p>

        {pendingArtists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#181818', borderRadius: '8px', color: '#b3b3b3' }}>
            <Users size={48} style={{ marginBottom: '12px', color: '#1db954' }} />
            <p>No pending artist applications at the moment.</p>
          </div>
        ) : (
          <div style={{ background: '#181818', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#282828', color: '#b3b3b3', fontSize: '14px' }}>
                  <th style={{ padding: '16px' }}>Artist Name</th>
                  <th style={{ padding: '16px' }}>Email</th>
                  <th style={{ padding: '16px' }}>Bio</th>
                  <th style={{ padding: '16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingArtists.map((artist) => (
                  <tr key={artist.id} style={{ borderBottom: '1px solid #282828', color: '#fff' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{artist.artistName}</td>
                    <td style={{ padding: '16px', color: '#b3b3b3' }}>{artist.email}</td>
                    <td style={{ padding: '16px', color: '#b3b3b3', maxWidth: '300px' }}>{artist.bio || 'No bio'}</td>
                    <td style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleAction(artist.username, 'approve')}
                        style={{ background: '#1db954', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(artist.username, 'reject')}
                        style={{ background: 'transparent', color: '#f44336', border: '1px solid #f44336', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={16} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}