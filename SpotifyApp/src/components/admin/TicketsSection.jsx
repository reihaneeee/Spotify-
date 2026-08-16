// src/pages/AdminDashboard/TicketsSection.jsx
import { useState, useEffect } from 'react';
import styles from '../../styles/TicketsSection.module.css';

const TicketsSection = ({ tickets, onReply, onCloseTicket }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (selectedTicket) {
      const freshTicket = tickets.find(t => t.id === selectedTicket.id);
      if (freshTicket) {
        setSelectedTicket(freshTicket);
      }
    }
  }, [tickets]);

  const handleReply = () => {
    if (replyText.trim() && selectedTicket) {
      onReply(selectedTicket.id, replyText);
      setReplyText('');
    }
  };

  const handleClose = async () => {
    if (selectedTicket && window.confirm('Are you sure you want to close this ticket?')) {
      if (onCloseTicket) {
        await onCloseTicket(selectedTicket.id);
      }
      setSelectedTicket(prev => prev ? { ...prev, status: 'closed' } : null);
    }
  };

  if (selectedTicket) {
    // نام کاربر را از کلیدهای مختلف چک می‌کنیم
    const displayName = selectedTicket.user_name || selectedTicket.userName || selectedTicket.user_email || `User #${selectedTicket.user}`;

    return (
      <div className={styles.ticketDetail} style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '8px' }}>
        <button className={styles.backBtn} onClick={() => setSelectedTicket(null)}>
          ← Back to tickets
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{selectedTicket.subject}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`${styles.statusBadge} ${styles[selectedTicket.status]}`}>
              {selectedTicket.status}
            </span>
            {selectedTicket.status !== 'closed' && (
              <button 
                onClick={handleClose}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}
              >
                Close Ticket
              </button>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <span>User: {displayName}</span>
          <span>Date: {new Date(selectedTicket.createdAt || selectedTicket.created_at).toLocaleString()}</span>
        </div>

        <div className={styles.chatBox} style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
          {selectedTicket.messages && selectedTicket.messages.map((msg, idx) => {
            // تشخیص اینکه آیا پیام از سمت کاربر ارسال شده است یا خیر
            const isUserMsg = msg.sender_type === 'user' || 
                              msg.sender === 'user' || 
                              msg.sender === selectedTicket.user;

            return (
              <div 
                key={msg.id || idx} 
                className={styles.message}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  alignSelf: isUserMsg ? 'flex-start' : 'flex-end',
                  background: isUserMsg ? '#2a2a2a' : '#1db954',
                  color: isUserMsg ? '#fff' : '#000',
                  border: isUserMsg ? '1px solid #3a3a3a' : 'none'
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  {isUserMsg ? 'User' : 'Support'}:
                </strong>
                {msg.text || msg.message}
                <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '0.5rem' }}>
                  {msg.created_at || msg.timestamp ? new Date(msg.created_at || msg.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
            );
          })}
        </div>

        {selectedTicket.status !== 'closed' ? (
          <div className={styles.replyBox} style={{ marginTop: '1.5rem' }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply to user..."
              rows="3"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#2a2a2a', border: '1px solid #3a3a3a', color: '#fff' }}
            />
            <button onClick={handleReply} className={styles.replyBtn} style={{ marginTop: '0.5rem' }}>
              Send Reply
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#2a2a2a', textAlign: 'center', borderRadius: '4px', color: '#b3b3b3' }}>
             This ticket is closed.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Support Tickets</h2>
      {tickets.length === 0 ? (
        <p className={styles.emptyMessage}>No tickets yet.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const displayName = ticket.user_name || ticket.userName || ticket.user_email || `User #${ticket.user}`;
                return (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td>{displayName}</td>
                    <td>{ticket.subject}</td>
                    <td>{new Date(ticket.createdAt || ticket.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={styles.viewBtn}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketsSection;