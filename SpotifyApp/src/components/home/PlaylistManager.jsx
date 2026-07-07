// src/components/home/PlaylistManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Music } from 'lucide-react';

export default function PlaylistManager({ currentUser, onSelectPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false); 

  const subType = currentUser?.subscription || 'basic'; 
  const limits = { basic: 6, silver: 100, gold: Infinity }; 
  const maxLimit = limits[subType];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('playlists') || '[]');
    // هماهنگی با کلید ساختار ذخیره‌سازی شما
    const userPlaylists = stored.filter(p => p.ownerEmail === currentUser?.email || p.createdBy === currentUser?.email);
    setPlaylists(userPlaylists);
  }, [currentUser]);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');

    if (playlists.length >= maxLimit) {
      alert(`❌ Playlist limit reached for your subscription type (${maxLimit}).`);
      return;
    }

    const newPlaylist = {
      id: 'pl_' + Date.now(),
      title: newPlaylistName.trim(), 
      name: newPlaylistName.trim(), // ست کردن هر دو کلید برای سازگاری کامل با دیتای قدیم و جدید
      owner: currentUser?.displayName || currentUser?.username || 'User',
      createdBy: currentUser?.email || '',
      ownerEmail: currentUser?.email || '',
      cover: 'https://picsum.photos/seed/' + Date.now() + '/300',
      songs: [] 
    };

    const updated = [newPlaylist, ...allPlaylists];
    localStorage.setItem('playlists', JSON.stringify(updated));
    
    setPlaylists([newPlaylist, ...playlists]);
    setNewPlaylistName('');
    setIsCreating(false); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreatePlaylist();
    }
  };

  const handleDeletePlaylist = (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      const allPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
      const updated = allPlaylists.filter(p => p.id !== id);
      localStorage.setItem('playlists', JSON.stringify(updated));
      setPlaylists(playlists.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'sans-serif', padding: '40px 24px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyHydration: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            My Playlists ({playlists.length} of {maxLimit === Infinity ? 'Unlimited' : maxLimit})
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#a7a7a7', fontSize: '14px' }}>Create and manage your personal collections</p>
        </div>

        {/* Action Button & Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isCreating && (
            <input
              type="text"
              placeholder="Playlist name + Enter..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                backgroundColor: '#242424',
                border: '1px solid #3e3e3e',
                borderRadius: '4px',
                color: '#fff',
                padding: '10px 16px',
                fontSize: '14px',
                outline: 'none',
                width: '220px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            />
          )}
          
          <button
            onClick={() => isCreating ? handleCreatePlaylist() : setIsCreating(true)}
            title="Create new playlist"
            style={{
              backgroundColor: '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
              transition: 'transform 0.2s ease, background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.backgroundColor = '#1ed760';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#1db954';
            }}
          >
            <Plus size={26} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#121212', borderRadius: '8px', border: '1px dashed #282828' }}>
          <Music size={48} style={{ color: '#535353', marginBottom: '16px' }} />
          <p style={{ color: '#b3b3b3', margin: 0, fontSize: '15px' }}>No playlists created yet. Click the "+" button above to start.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
          {playlists.map(p => (
            <div 
              key={p.id} 
              onClick={() => onSelectPlaylist && onSelectPlaylist(p)} // بازگشت به منطق استیت محلی شما برای جلوگیری از صفحه سیاه
              style={{
                backgroundColor: '#181818',
                padding: '16px',
                borderRadius: '8px',
                position: 'relative',
                transition: 'background-color 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#282828'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#181818'}
            >
              <div style={{ 
                width: '100%', 
                paddingTop: '100%', 
                backgroundColor: '#282828', 
                borderRadius: '6px', 
                marginBottom: '14px',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}>
                {p.cover ? (
                  <img src={p.cover} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
                ) : (
                  <Music size={40} style={{ color: '#b3b3b3', position: 'absolute', top: 'calc(50% - 20px)', left: 'calc(50% - 20px)' }} />
                )}
              </div>
              
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.title || p.name}
              </h3>
              
              <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>
                {p.songs?.length || 0} tracks
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleDeletePlaylist(p.id);
                }}
                title="Delete Playlist"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#b3b3b3',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#e91429'}
                onMouseOut={(e) => e.currentTarget.style.color = '#b3b3b3'}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}