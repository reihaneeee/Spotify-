import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'; // NEW (phase 2 sync)
import './styles/auth.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* SubscriptionProvider must be inside AuthProvider: it reads useAuth().user
            to know when to fetch /subscriptions/my/ */}
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
