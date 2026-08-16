import { useState, useEffect } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { Check, X, ShieldAlert, UserCheck } from 'lucide-react';

export default function AdminTickets() {
  const [activeTab, setActiveTab] = useState('artists'); // 'artists' | 'tickets'
  const [pendingArtists, setPendingArtists] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  useEffect(() => {
    // بارگذاری داده‌های اولیه از LocalStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    
    setPendingArtists(users.filter(u => u.userType === 'artist' && u.status === 'pending'));
    setSupportTickets(tickets.filter(t => t.status === 'open'));
  }, []);

  const handleArtistAction = (username, action) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => 
      u.username === username ? { ...u, status: action === 'approve' ? 'approved' : 'rejected' } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setPendingArtists(prev => prev.filter(u => u.username !== username));
  };

  return (
    <div className={styles.card}>
      <div className={styles.tabs}>
        <button className={activeTab === 'artists' ? styles.active : ''} onClick={() => setActiveTab('artists')}>
          <UserCheck size={18} /> Artist Verifications ({pendingArtists.length})
        </button>
        <button className={activeTab === 'tickets' ? styles.active : ''} onClick={() => setActiveTab('tickets')}>
          <ShieldAlert size={18} /> Support Tickets ({supportTickets.length})
        </button>
      </div>

      {activeTab === 'artists' ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Artist Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingArtists.map(artist => (
              <tr key={artist.username}>
                <td>{artist.artistName}</td>
                <td>{artist.email}</td>
                <td>
                  <button onClick={() => handleArtistAction(artist.username, 'approve')} className={styles.btnApprove}>
                    <Check size={16} /> Approve
                  </button>
                  <button onClick={() => handleArtistAction(artist.username, 'reject')} className={styles.btnReject}>
                    <X size={16} /> Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {supportTickets.map(ticket => (
              <tr key={ticket.id}>
                <td>{ticket.user}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.message}</td>
                <td><span className={styles.badgeWarning}>Open</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}