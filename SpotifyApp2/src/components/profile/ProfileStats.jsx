// src/components/profile/ProfileStats.jsx

// import React from 'react';

const BASIC_DAILY_LIMIT = 60;

export default function ProfileStats({ user }) {
  const subscription = user.subscription || 'basic';
  const streamedToday = user.streamedToday ?? 0;
  const isBasic = subscription === 'basic';

  return (
    <section className="profile-stats">
      <div className="stat-card">
        <span className="stat-label">Streamed today</span>
        <span className="stat-value">
          {streamedToday}
          {isBasic && (
            <span className="stat-limit"> / {BASIC_DAILY_LIMIT}</span>
          )}
        </span>
        {isBasic && (
          <span className="stat-hint">
            Basic plan: {BASIC_DAILY_LIMIT} songs per day
          </span>
        )}
        {!isBasic && (
          <span className="stat-hint">Unlimited streaming</span>
        )}
      </div>
    </section>
  );
}
