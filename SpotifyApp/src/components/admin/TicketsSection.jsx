// src/pages/AdminDashboard/TicketsSection.jsx
import { useState, useEffect } from 'react';
import styles from '../../styles/TicketsSection.module.css';

const TicketsSection = ({ tickets, onReply }) => {
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
    if (replyText.trim()) {
      onReply(selectedTicket.id, replyText);
      setReplyText('');
      
    }
  };

  if (selectedTicket) {
    return (
      <div className={styles.ticketDetail} style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '8px' }}>
        <button className={styles.backBtn} onClick={() => setSelectedTicket(null)}>
          ← Back to tickets
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{selectedTicket.subject}</h3>
          <span className={`${styles.statusBadge} ${styles[selectedTicket.status]}`}>
            {selectedTicket.status}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <span>User: {selectedTicket.userName}</span>
          <span>Date: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
        </div>

        {/* 👇 استایل چت‌باکس دقیقاً مشابه SupportPage.jsx */}
        <div className={styles.chatBox} style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
          {selectedTicket.messages && selectedTicket.messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={styles.message}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                maxWidth: '80%',
                alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                background: msg.sender === 'user' ? '#2a2a2a' : '#1db954',
                color: msg.sender === 'user' ? '#fff' : '#000',
                border: msg.sender === 'user' ? '1px solid #3a3a3a' : 'none'
              }}
            >
              <strong style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                {msg.sender === 'user' ? 'User' : 'You (Support)'}:
              </strong>
              {msg.text}
              <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '0.5rem' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
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
             This ticket has been closed by the user.
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
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.userName}</td>
                  <td>{ticket.subject}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketsSection;