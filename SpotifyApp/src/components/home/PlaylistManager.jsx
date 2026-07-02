// src/components/home/PlaylistManager.jsx
import React, { useState, useEffect } from 'react';

export default function PlaylistManager({ currentUser }) {
  const [playlists, setPlaylists] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  const subType = currentUser?.subscription || 'free';
  const limits = { free: 6, silver: 100, gold: Infinity };
  const maxLimit = limits[subType];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(stored);
  }, []);

  const saveToStorage = (updated) => {
    setPlaylists(updated);
    localStorage.setItem('playlists', JSON.stringify(updated));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (playlists.length >= maxLimit) {
      alert(`محدودیت تعداد پلی‌لیست برای اشتراک شما (${maxLimit}) تکمیل شده است.`);
      return;
    }

    const newPlaylist = {
      id: 'p_' + Date.now(),
      title: nameInput,
      owner: currentUser?.displayName || 'User',
      cover: 'https://picsum.photos/seed/' + Date.now() + '/300',
      songCount: 0,
      songs: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveToStorage([newPlaylist, ...playlists]);
    setNameInput('');
  };

  const handleRename = (id, currentTitle) => {
    setEditingId(id);
    setNameInput(currentTitle);
  };

  const handleSaveRename = (id) => {
    saveToStorage(playlists.map(p => p.id === id ? { ...p, title: nameInput } : p));
    setEditingId(null);
    setNameInput('');
  };

  const handleDelete = (id) => {
    saveToStorage(playlists.filter(p => p.id !== id));
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h3>مدیریت لیست‌های پخش ({playlists.length} از {maxLimit === Infinity ? 'نامحدود' : maxLimit})</h3>
      
      <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveRename(editingId); } : handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={nameInput} 
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="نام پلی‌لیست..."
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#181818', color: '#fff', flex: 1 }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#1db954', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          {editingId ? 'اعمال تغییر نام' : 'ایجاد پلی‌لیست'}
        </button>
      </form>

      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666' }}>پلی‌لیستی موجود نیست. اولین پلی‌لیست خود را بسازید!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {playlists.map(p => (
            <div key={p.id} style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '6px' }}>
              <img src={p.cover} alt="" style={{ width: '100%', borderRadius: '4px', marginBottom: '10px' }} />
              <h4>{p.title}</h4>
              <p style={{ fontSize: '12px', color: '#aaa' }}>تعداد آهنگ: {p.songs?.length || 0}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleRename(p.id, p.title)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#1db954', cursor: 'pointer' }}>تغییر نام</button>
                <button onClick={() => handleDelete(p.id)} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#e91429', cursor: 'pointer' }}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}