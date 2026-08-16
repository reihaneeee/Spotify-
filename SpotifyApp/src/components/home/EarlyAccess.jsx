// src/components/home/EarlyAccess.jsx

import MediaCard from './MediaCard';

/**
 * Early Access Section
 * Exclusive content visible only to Gold subscribers.
 */
function EarlyAccess({ items, isGold }) {
  if (!isGold) {
    return (
      <section className="early-access locked">
        <div className="early-access-header">
          <h3>⭐ Early Access</h3>
        </div>
        <div className="early-access-locked-card">
          <p>Early Access is exclusive to Gold members.</p>
          <button className="btn-primary">Upgrade to Gold</button>
        </div>
      </section>
    );
  }

  return (
    <section className="early-access">
      <div className="early-access-header">
        <h3>⭐ Early Access</h3>
        <span className="badge-gold">Gold</span>
      </div>

      <div className="showcase-grid">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} type="song" />
        ))}
      </div>
    </section>
  );
}

export default EarlyAccess;
