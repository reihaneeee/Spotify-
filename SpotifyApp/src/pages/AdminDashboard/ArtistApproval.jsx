// src/pages/AdminDashboard/ArtistApproval.jsx
import { useState } from 'react';
import styles from './AdminDashboard.module.css';

const ArtistApproval = ({ artists, onApprove, onReject }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  if (selectedArtist) {
    // 👇 پشتیبانی از آرایه portfolioLinks یا رشته portfolio
    const portfolioLinks = selectedArtist.portfolioLinks || 
                           (selectedArtist.portfolio ? [selectedArtist.portfolio] : []);

    return (
      <div className={styles.artistDetail}>
        <button className={styles.backBtn} onClick={() => setSelectedArtist(null)}>
          ← Back to Requests
        </button>
        <h3 style={{ marginTop: '1rem' }}>
          Review Artist: {selectedArtist.artistName || selectedArtist.displayName || selectedArtist.email}
        </h3>

        <div style={{ background: '#222', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <p><strong>Email:</strong> {selectedArtist.email}</p>

          {/* 👇 نمایش لینک‌های پورتفولیو */}
          <p><strong>Portfolio / Samples:</strong></p>
          {portfolioLinks.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {portfolioLinks.map((link, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#1db954' }}
                  >
                    🔗 {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ color: '#888' }}>No portfolio provided</span>
          )}

          <p><strong>Requested At:</strong> {new Date(selectedArtist.id).toLocaleDateString()}</p>
        </div>

        <div className={styles.approvalActions} style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className={styles.approveBtn}
            onClick={() => {
              onApprove(selectedArtist.id);
              setSelectedArtist(null);
            }}
          >
            ✅ Approve Artist
          </button>

          <div className={styles.rejectSection} style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Reason for rejection (required)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
            />
            <button 
              className={styles.rejectBtn}
              onClick={() => {
                if (rejectReason.trim()) {
                  onReject(selectedArtist.id, rejectReason);
                  setSelectedArtist(null);
                  setRejectReason('');
                } else {
                  alert('Please provide a reason for rejection');
                }
              }}
            >
              ❌ Reject
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
        <p className={styles.emptyMessage}>🎉 All caught up! No pending requests.</p>
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