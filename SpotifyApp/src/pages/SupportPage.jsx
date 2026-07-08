// src/pages/Support/SupportPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Sidebar from '../components/home/Sidebar';
import styles from '../styles/SupportPage.module.css';
import { BackIcon } from '../components/icons';
import { triggerNewTicketNotification } from '../utils/notificationEngine'; // 👈 ۱. اضافه شدن موتور اعلان سیستم

const SupportPage = () => {
  const { user } = useAuth();
  const { tickets, addTicket, getTicketsForUser, addUserReplyToTicket } = useData();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!user) return null;

  const userTickets = getTicketsForUser(user?.id || user?.username);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in subject and message.');
      return;
    }

    const userId = user.id || user.username;

    addTicket({
      userId: userId,
      userName: user.displayName || user.artistName || user.email,
      subject: subject,
      messages: [{ sender: 'user', text: message, timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    });

    // 👈 ۲. شلیک خودکار اعلان سیستم برای باخبر کردن تمام ادمین‌ها در پنل مدیریت
    triggerNewTicketNotification(userId, subject.trim());

    setSubject('');
    setMessage('');
    alert('Ticket sent successfully!');
  };

  const handleUserReply = () => {
    if (!replyText.trim()) return;
    addUserReplyToTicket(selectedTicket.id, replyText);
    setReplyText('');
  };

  const handleCloseTicket = () => {
    if(window.confirm('Are you sure you want to close this ticket?')) {
        closeTicket(selectedTicket.id);
        setSelectedTicket({...selectedTicket, status: 'closed'});
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
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Close Ticket
                  </button>
                )}
              </div>
              <div className={styles.ticketMeta}>
                <span>Status: {selectedTicket.status}</span>
                <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
              <div className={styles.chatBox}>
                {selectedTicket.messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.supportMsg}`}
                  >
                    <strong>{msg.sender === 'user' ? 'You' : 'Support'}:</strong>
                    {msg.text}
                    <span className={styles.msgTime}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              {/* 👇 فرم پاسخ برای کاربر */}
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
              {userTickets.length === 0 ? (
                <p className={styles.emptyMessage}>You have no tickets.</p>
              ) : (
                <div className={styles.ticketList}>
                  {userTickets.map((ticket) => (
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
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>{ticket.messages.length} messages</span>
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