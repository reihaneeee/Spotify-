import { formatPlays } from '../../utils/mockData';
import { Link } from 'react-router-dom';

/**
 * Reusable Media Card
 * Renders a song, album or playlist cover with metadata.
 */
function MediaCard({ item, type }) {
  return (
    <div className="media-card">
      <div className="media-cover-wrapper">
        <img src={item.cover} alt={item.title} className="media-cover" />
        <button className="media-play-btn" aria-label={`Play ${item.title}`}>
          ▶
        </button>
      </div>

      <h4 className="media-title">{item.title}</h4>

      <p className="media-subtitle">
        {type === 'song' && item.artist}
        {type === 'album' && `${item.artist} • ${item.year}`}
        {type === 'playlist' && `${item.songCount} songs`}
      </p>

      {/* ایمن‌سازی برای نمایش تعداد پخش */}
      {type === 'song' && item.plays !== undefined && item.plays !== null && (
        <p className="media-meta">{formatPlays(item.plays)} plays</p>
      )}

      <p className="media-artist">
        <Link to={`/artist/${item.artistId}`}>{item.artist}</Link>
      </p>
      
    </div>
  );
}

export default MediaCard;