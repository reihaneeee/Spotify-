// src/pages/Support/SupportPage.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Sidebar from '../../components/home/Sidebar';
import styles from './SupportPage.module.css';
import { BackIcon } from '../../components/icons';

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
    addTicket({
      userId: user.id || user.username,
      userName: user.displayName || user.artistName || user.email,
      subject: subject,
      messages: [{ sender: 'user', text: message, timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    });
    setSubject('');
    setMessage('');
    alert('Ticket sent!');
  };

  const handleUserReply = () => {
    if (!replyText.trim()) return;
    addUserReplyToTicket(selectedTicket.id, replyText);
    setReplyText('');
    // به‌روزرسانی تیکت انتخاب شده
    const updated = tickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
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
              <h3>{selectedTicket.subject}</h3>
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
              <div className={styles.replyBox}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows="3"
                />
                <button onClick={handleUserReply} className={styles.replyBtn}>
                  Send Reply
                </button>
              </div>
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