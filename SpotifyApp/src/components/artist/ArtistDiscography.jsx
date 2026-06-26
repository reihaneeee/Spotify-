// import React from 'react';
import MediaCard from '../home/MediaCard';

export default function ArtistDiscography({ artist }) {
  const albums = artist.albums || [];
  const singles = artist.singles || [];

  return (
    <div className="artist-discography">
      {albums.length > 0 && (
        <section className="discography-section">
          <h2 className="section-title">Albums</h2>
          <div className="discography-grid">
            {albums.map((album) => (
              <MediaCard key={album.id} item={album} type="album" />
            ))}
          </div>
        </section>
      )}

      {singles.length > 0 && (
        <section className="discography-section">
          <h2 className="section-title">Singles</h2>
          <div className="discography-grid">
            {singles.map((song) => (
              <MediaCard key={song.id} item={song} type="song" />
            ))}
          </div>
        </section>
      )}

      {albums.length === 0 && singles.length === 0 && (
        <p className="discography-empty">No releases yet.</p>
      )}
    </div>
  );
}
