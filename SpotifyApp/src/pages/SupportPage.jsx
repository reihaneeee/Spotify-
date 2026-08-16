// src/pages/Support/SupportPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/home/Sidebar';
import styles from '../styles/SupportPage.module.css';
import { BackIcon } from '../components/icons';
import { triggerNewTicketNotification } from '../utils/notificationEngine';
import { fetchTickets, createTicket, replyTicket, closeTicketApi } from '../services/ticketApi';

const SupportPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserTickets();
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in subject and message.');
      return;
    }

    try {
      await createTicket(subject.trim(), message.trim());
      triggerNewTicketNotification(user.id || user.username, subject.trim());
      setSubject('');
      setMessage('');
      alert('Ticket sent successfully!');
      loadUserTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to send ticket to server.');
    }
  };

  const handleUserReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const updatedTicket = await replyTicket(selectedTicket.id, replyText);
      setSelectedTicket(updatedTicket);
      setReplyText('');
      loadUserTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to send reply.');
    }
  };

  const handleCloseTicket = async () => {
    if (selectedTicket && window.confirm('Are you sure you want to close this ticket?')) {
      try {
        const updatedTicket = await closeTicketApi(selectedTicket.id);
        setSelectedTicket(updatedTicket);
        loadUserTickets();
      } catch (err) {
        console.error(err);
        alert('Failed to close ticket.');
      }
    }
  };

  return (
    <div className="home-layout">
      <Sidebar />
      <main className={styles.supportPage}>
        {selectedTicket ? (
          <div>
            <button className={styles.backBtn} onClick={() => setSelectedTicket(null)}>
              <BackIcon size={20} /> Back to tickets
            </button>
            <div className={styles.ticketDetail}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{selectedTicket.subject}</h3>
                {selectedTicket.status !== 'closed' && (
                  <button 
                    onClick={handleCloseTicket} 
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Close Ticket
                  </button>
                )}
              </div>
              <div className={styles.ticketMeta}>
                <span>Status: {selectedTicket.status}</span>
                <span>Created: {new Date(selectedTicket.created_at || selectedTicket.createdAt).toLocaleString()}</span>
              </div>
              <div className={styles.chatBox}>
                {selectedTicket.messages?.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.message} ${msg.sender_type === 'user' || msg.sender === user.id ? styles.userMsg : styles.supportMsg}`}
                  >
                    <strong>{msg.sender_type === 'user' || msg.sender === user.id ? 'You' : 'Support'}:</strong>
                    {msg.text || msg.message}
                    <span className={styles.msgTime}>
                      {msg.created_at || msg.timestamp ? new Date(msg.created_at || msg.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' ? (
                <div className={styles.replyBox} style={{ marginTop: '1rem' }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows="3"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#2a2a2a', color: '#fff', border: '1px solid #333' }}
                  />
                  <button onClick={handleUserReply} className={styles.submitBtn} style={{ marginTop: '0.5rem' }}>
                    Send Reply
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#2a2a2a', textAlign: 'center', borderRadius: '4px', color: '#b3b3b3' }}>
                  This ticket is closed. You cannot reply to a closed ticket.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2>Support</h2>
            <div className={styles.newTicket}>
              <h3>Create New Ticket</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Describe your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  required
                />
                <button type="submit" className={styles.submitBtn}>Send</button>
              </form>
            </div>

            <div className={styles.myTickets}>
              <h3>My Tickets</h3>
              {loading ? (
                <p>Loading tickets...</p>
              ) : tickets.length === 0 ? (
                <p className={styles.emptyMessage}>You have no tickets.</p>
              ) : (
                <div className={styles.ticketList}>
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className={styles.ticketCard}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className={styles.ticketHeader}>
                        <span className={styles.ticketSubject}>{ticket.subject}</span>
                        <span className={`${styles.statusBadge} ${styles[ticket.status]}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className={styles.ticketFooter}>
                        <span>{new Date(ticket.created_at || ticket.createdAt).toLocaleDateString()}</span>
                        <span>{ticket.messages?.length || 0} messages</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SupportPage;