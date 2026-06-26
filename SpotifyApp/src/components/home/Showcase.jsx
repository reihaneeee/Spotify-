import MediaCard from './MediaCard';

/**
 * Showcase Section
 * A titled horizontal row of media cards.
 */
function Showcase({ title, items, type }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="showcase">
      <div className="showcase-header">
        <h3>{title}</h3>
        <button className="showcase-more">Show all</button>
      </div>

      <div className="showcase-grid">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </section>
  );
}

export default Showcase;
