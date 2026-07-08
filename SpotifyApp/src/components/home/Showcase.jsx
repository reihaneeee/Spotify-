// src/components/home/Showcase.jsx
import MediaCard from './MediaCard';

function Showcase({ title, items, type, onSelect, onSelectArtist, onSelectAlbum }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="showcase">
      <div className="showcase-header">
        <h3>{title}</h3>
        <button className="showcase-more">Show all</button>
      </div>

      <div className="showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
        {items.map((item) => (
          <MediaCard 
            key={item.id} 
            item={item} 
            type={type} 
            onSelect={onSelect}
            onSelectArtist={onSelectArtist}
            onSelectAlbum={onSelectAlbum}
          />
        ))}
      </div>
    </section>
  );
}

export default Showcase;