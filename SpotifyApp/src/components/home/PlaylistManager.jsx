// src/components/home/PlaylistManager.jsx
import React, { useState, useEffect } from 'react';

export default function PlaylistManager({ currentUser, onSelectPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  // استخراج سطح اشتراک و اعمال محدودیت‌ها طبق جدول فاز اول پروژه
  const subType = currentUser?.subscription || 'basic'; 
  const limits = { basic: 6, silver: 100, gold: Infinity }; 
  const maxLimit = limits[subType];

  // لود کردن پلی‌لیست‌ها در ابتدای کامپوننت
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(stored);
  }, []);

  // تابع کمکی برای ذخیره در لوکال استوریج و آپدیت استیت
  const saveToStorage = (updatedList) => {
    setPlaylists(updatedList);
    localStorage.setItem('playlists', JSON.stringify(updatedList));
  };

  // تابع ساخت پلی‌لیست جدید
  const handleCreate = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    // بررسی سقف مجاز اشتراک کاربر
    if (playlists.length >= maxLimit) {
      alert(`❌ محدودیت تعداد پلی‌لیست برای اشتراک شما (${maxLimit}) تکمیل شده است.`);
      return;
    }

    const newPlaylist = {
      id: 'p_' + Date.now(),
      title: nameInput, 
      owner: currentUser?.displayName || currentUser?.username || 'User',
      ownerEmail: currentUser?.email || '',
      cover: 'https://picsum.photos/seed/' + Date.now() + '/300',
      songs: [] 
    };

    saveToStorage([newPlaylist, ...playlists]);
    setNameInput('');
  };

  // باز کردن مود ویرایش نام
  const handleRename = (id, currentTitle) => {
    setEditingId(id);
    setNameInput(currentTitle);
  };

  // ذخیره نام جدید پلی‌لیست
  const handleSaveRename = (id) => {
    const updated = playlists.map(p => p.id === id ? { ...p, title: nameInput } : p);
    saveToStorage(updated);
    setEditingId(null);
    setNameInput('');
  };

  // حذف پلی‌لیست
  const handleDelete = (id) => {
    const updated = playlists.filter(p => p.id !== id);
    saveToStorage(updated);
  };

  return (
    <div style={{ padding: '20px', color: '#fff', direction: 'rtl' }}>
      <h3>مدیریت لیست‌های پخش ({playlists.length} از {maxLimit === Infinity ? 'نامحدود' : maxLimit})</h3>
      
      {/* فرم ساخت یا تغییر نام */}
      <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveRename(editingId); } : handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={nameInput} 
          onChange={(e) => setNameInput(e.target.value)}
          placeholder={editingId ? "نام جدید پلی‌لیست..." : "نام پلی‌لیست جدید..."}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#181818', color: '#fff', flex: 1, textAlign: 'right' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#1db954', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          {editingId ? 'اعمال تغییر نام' : 'ایجاد پلی‌لیست'}
        </button>
      </form>

      {/* لیست کارت‌ها */}
      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>پلی‌لیستی موجود نیست. اولین پلی‌لیست خود را بسازید!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {playlists.map(p => (
            <div key={p.id} style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '6px' }}>
              
              <div onClick={() => onSelectPlaylist ? onSelectPlaylist(p) : null} style={{ cursor: 'pointer' }}>
                <img src={p.cover} alt="" style={{ width: '100%', borderRadius: '4px', marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 5px 0', textAlign: 'right' }}>{p.title}</h4>
              </div>
              
              <p style={{ fontSize: '12px', color: '#aaa', margin: '5px 0', textAlign: 'right' }}>تعداد آهنگ: {p.songs?.length || 0}</p>
              
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