// src/pages/AdminDashboard/ArtistApproval.jsx
import { useState } from 'react';
import styles from './AdminDashboard.module.css';
import { User, Mail, Link as LinkIcon, Calendar, CheckCircle, XCircle } from 'lucide-react';

const ArtistApproval = ({ artists, onApprove, onReject }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  if (selectedArtist) {
    const portfolioLinks = selectedArtist.portfolioLinks || (selectedArtist.portfolio ? [selectedArtist.portfolio] : []);
    // 👇 مدیریت صحیح تاریخ درخواست (fallback به زمان حال اگر وجود نداشت)
    const requestDate = selectedArtist.createdAt ? new Date(selectedArtist.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    return (
      <div className={styles.artistDetail} style={{ animation: 'fadeIn 0.3s ease' }}>
        <button className={styles.backBtn} onClick={() => setSelectedArtist(null)}>
          ← Back to Requests
        </button>
        
        <h3 style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} color="#1db954" /> 
          Review Artist: {selectedArtist.artistName || selectedArtist.displayName || selectedArtist.email}
        </h3>

        <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem', border: '1px solid #2a2a2a' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <Mail size={18} color="#b3b3b3" /> <strong>Email:</strong> {selectedArtist.email}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <Calendar size={18} color="#b3b3b3" /> <strong>Requested At:</strong> {requestDate}
          </p>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a2a' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <LinkIcon size={18} color="#b3b3b3" /> <strong>Portfolio / Samples:</strong>
            </p>
            {portfolioLinks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem' }}>
                {portfolioLinks.map((link, idx) => (
                  <a key={idx} href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954', textDecoration: 'none', background: '#2a2a2a', padding: '0.5rem 1rem', borderRadius: '4px', display: 'inline-block' }}>
                    🔗 {link}
                  </a>
                ))}
              </div>
            ) : (
              <span style={{ color: '#ef4444', paddingLeft: '1.5rem' }}>⚠️ No portfolio provided</span>
            )}
          </div>
        </div>

        <div className={styles.approvalActions} style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button 
            className={styles.approveBtn}
            onClick={() => { onApprove(selectedArtist.id || selectedArtist.username); setSelectedArtist(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <CheckCircle size={18} /> Approve Artist
          </button>

          <div className={styles.rejectSection} style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Reason for rejection (required)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #3a3a3a', background: '#1a1a1a', color: '#fff' }}
            />
            <button 
              className={styles.rejectBtn}
              onClick={() => {
                if (rejectReason.trim()) {
                  onReject(selectedArtist.id || selectedArtist.username, rejectReason);
                  setSelectedArtist(null);
                  setRejectReason('');
                } else {
                  alert('Please provide a reason for rejection');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <XCircle size={18} /> Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Artist Approval Requests</h2>
      {artists.length === 0 ? (
        <p className={styles.emptyMessage}>All caught up! No pending requests.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artist Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id}>
                  <td>{artist.artistName || artist.displayName || 'N/A'}</td>
                  <td>{artist.email}</td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelectedArtist(artist)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArtistApproval;