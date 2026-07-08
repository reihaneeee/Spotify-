// src/components/home/MediaCard.jsx
import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { Music } from 'lucide-react';

export default function MediaCard({ item, type, onSelect, onSelectArtist, onSelectAlbum }) {
  const { playSong } = usePlayback();

  const handleCardClick = () => {
    if (type === 'album' && onSelect) {
      onSelect(item);
    } else if (type === 'playlist' && onSelect) {
      onSelect(item);
    } else if (type === 'song') {
      // پخش مستقیم آهنگ در صورت کلیک روی کارت قطعه
      playSong({ ...item, itemType: 'song', src: item.src || item.audioUrl || item.audioData || '' }, []);
    }
  };

  return (
    <div 
      className="media-card" 
      onClick={handleCardClick}
      style={{ 
        padding: '16px', 
        borderRadius: '8px', 
        backgroundColor: '#181818', 
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* 🛠️ فیکس باگ عکس کاور: رندر آیکون موزیک در صورت نبودن کاور */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '100%', 
        marginBottom: '14px', 
        backgroundColor: '#282828',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {item.cover && !item.cover.includes('placeholder') ? (
          <img src={item.cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Music size={40} style={{ color: '#535353' }} />
          </div>
        )}
      </div>

      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
        {item.title || item.name}
      </h4>

      {/* 🛠️ فیکس لینک آرتیست: کلیک‌پذیر شدن نام خواننده در صفحه هوم */}
      {item.artist && (
        <p 
          onClick={(e) => {
            e.stopPropagation(); // جلوگیری از فعال شدن کلیک خود کارت
            if (onSelectArtist) onSelectArtist(item.artistId || item.artist);
          }}
          style={{ color: '#b3b3b3', fontSize: '12px', margin: '0 0 4px 0', cursor: 'pointer' }}
          onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          {item.artist}
        </p>
      )}

      {/* نمایش لینک آلبوم در صورت وجود */}
      {type === 'song' && item.albumTitle && (
        <p 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectAlbum) onSelectAlbum({ title: item.albumTitle, artist: item.artist });
          }}
          style={{ color: '#1db954', fontSize: '11px', margin: 0, cursor: 'pointer' }}
        >
          💿 {item.albumTitle}
        </p>
      )}
    </div>
  );
}