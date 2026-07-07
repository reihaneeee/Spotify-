// src/pages/AdminDashboard/TicketsSection.jsx
import { useState } from 'react';
import styles from './AdminDashboard.module.css';
import { CloseIcon } from '../../components/icons';

const TicketsSection = ({ tickets, onReply }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(selectedTicket.id, replyText);
      setReplyText('');
    }
  };

  if (selectedTicket) {
    return (
      <div className={styles.ticketDetail}>
        <button 
          className={styles.backBtn} 
          onClick={() => setSelectedTicket(null)}
        >
          ← Back to tickets
        </button>
        
        <div className={styles.ticketHeader}>
          <h3>{selectedTicket.subject}</h3>
          <span className={`${styles.ticketStatus} ${styles[selectedTicket.status]}`}>
            {selectedTicket.status}
          </span>
        </div>
        
        <div className={styles.ticketMeta}>
          <span>User: {selectedTicket.userName}</span>
          <span>Date: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
        </div>

        <div className={styles.chatBox}>
          {selectedTicket.messages && selectedTicket.messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.supportMsg}`}
            >
              <strong>{msg.sender === 'user' ? 'User' : 'Support'}:</strong>
              {msg.text}
              <span className={styles.msgTime}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>

        <div className={styles.replyBox}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            rows="3"
          />
          <button onClick={handleReply} className={styles.replyBtn}>
            Send Reply
          </button>
        </div>
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