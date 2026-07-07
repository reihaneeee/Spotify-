// src/context/DataContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const [tickets, setTickets] = useState(() => {
    const stored = localStorage.getItem('app_tickets');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const [financials, setFinancials] = useState(() => {
    const stored = localStorage.getItem('app_financials');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_financials', JSON.stringify(financials));
  }, [financials]);

  const addUser = (user) => setUsers(prev => [...prev, { ...user, id: Date.now() }]);
  const updateUser = (id, updates) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  const getUserByEmail = (email) => users.find(u => u.email === email);
  
  const addTicket = (ticket) => setTickets(prev => [...prev, { ...ticket, id: Date.now(), messages: ticket.messages || [], status: 'open' }]);
  const addReplyToTicket = (ticketId, reply) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId 
        ? { ...t, messages: [...t.messages, { sender: 'support', text: reply, timestamp: new Date().toISOString() }], status: 'replied' }
        : t
    ));
  };
  const getTicketsForUser = (userId) => tickets.filter(t => t.userId === userId);

  return (
    <DataContext.Provider value={{
      users, tickets, financials,
      addUser, updateUser, getUserByEmail,
      addTicket, addReplyToTicket, getTicketsForUser, setFinancials,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);