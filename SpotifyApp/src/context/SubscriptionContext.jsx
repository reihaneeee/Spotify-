// src/context/SubscriptionContext.jsx
//
// NEW context. Before phase 2, every component read `currentUser.subscription`
// (a plain string baked into the fake localStorage user). Now that pricing
// and limits are dynamic and admin-editable on the backend (spec rule "no
// code change to alter prices"), the tier + limits have to be fetched, not
// read off the user object. This context is the one place that happens, so
// NotificationsPanel / PlaylistManager / MusicArchive / MusicPlayerFixed can
// all just call useSubscription() instead of poking at localStorage.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchMySubscription } from '../services/subscriptionApi';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMySubscription();
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan = subscription?.plan;
  const tier = plan?.tier || 'basic';

  const value = {
    subscription,
    plan,
    tier,
    isGold: tier === 'gold',
    isSilver: tier === 'silver',
    loading,
    refresh,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};
