// src/components/artist/ArtistStats.jsx

//import React from 'react';

export default function ArtistStats({ artist }) {
  const listeners = artist.listeners ?? 0;
  const streams = artist.streams ?? 0;

  return (
    <section className="artist-stats">
      <div className="stat-card">
        <span className="stat-label">Monthly Listeners</span>
        <span className="stat-value">{listeners.toLocaleString()}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Total Streams</span>
        <span className="stat-value">{streams.toLocaleString()}</span>
      </div>
    </section>
  );
}
