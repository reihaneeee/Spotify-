// src/pages/ArtistDashboard.jsx
import styles from '../styles/ArtistDashboard.module.css';
import UploadWork from '../components/artist_dashboard/UploadWork';
import MyWorksList from '../components/artist_dashboard/MyWorksList';
import WorkStats from '../components/artist_dashboard/WorkStats';
import { MusicIcon } from '../components/icons';
import { useWorks } from '../hooks/useWorks';
import { useState } from 'react';
import { createSong, createAlbum, updateSong, updateAlbum, deleteSong, deleteAlbum } from '../services/catalogApi';

import Sidebar from '../components/home/Sidebar';
import { useAuth } from '../context/AuthContext';

export const normalizeWork = (work, currentUserId) => {
  if (!work) return null;

  const rawTracks = Array.isArray(work.tracks) ? work.tracks : [];
  const isAlbum = work.type === 'album' || rawTracks.length > 0 || (typeof work.track_count === 'number' && work.track_count > 0);
  const type = isAlbum ? 'album' : 'single';

  const cover = work.cover_image || work.cover || work.coverUrl || '';
  const releaseDate = work.release_date || work.releaseDate || new Date().toISOString().split('T')[0];
  const collaborators = work.featured_artist_names || work.collaborators || '';
  const plays = work.play_count ?? work.plays ?? 0;
  const listeners = work.unique_listeners_count ?? work.listeners ?? 0;
  const audioUrl = work.audio_file || work.audioUrl || work.audioData || '';

  let rawArtist = work.artistId || work.artist_id || work.artist;
  let artistId = '';
  let artistName = work.artistName || work.artist_name || '';

  if (typeof rawArtist === 'object' && rawArtist !== null) {
    artistId = rawArtist.id || rawArtist.pk || rawArtist.username || '';
    artistName = artistName || rawArtist.username || rawArtist.name || rawArtist.artist_name || '';
  } else if (rawArtist !== undefined && rawArtist !== null) {
    artistId = String(rawArtist);
  }

  // فقط در صورتی که اطلاعات شناسه هنرمند وجود نداشت، از شناسه کاربر جاری استفاده شود
  if (!artistId && currentUserId && rawArtist === undefined) {
    artistId = String(currentUserId);
  }

  const tracks = rawTracks.map(t => ({
    ...t,
    id: t.id,
    title: t.title || '',
    audioUrl: t.audio_file || t.audioUrl || t.audioData || '',
    audio_file: t.audio_file || t.audioUrl || t.audioData || '',
    plays: t.play_count ?? t.plays ?? 0,
    listeners: t.unique_listeners_count ?? t.listeners ?? 0,
    lyrics: t.lyrics || '',
  }));

  return {
    ...work,
    id: work.id,
    title: work.title || '',
    type,
    genre: work.genre || '',
    releaseDate,
    release_date: releaseDate,
    collaborators,
    featured_artist_names: collaborators,
    lyrics: work.lyrics || '',
    cover,
    cover_image: cover,
    audio_file: audioUrl,
    audioUrl,
    audioData: work.audioData || audioUrl,
    audioFileName: work.audioFileName || (typeof audioUrl === 'string' ? audioUrl.split('/').pop() : ''),
    plays,
    play_count: plays,
    listeners,
    unique_listeners_count: listeners,
    artistId,
    artistName,
    tracks: tracks,
  };
};

const ArtistDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [editingWork, setEditingWork] = useState(null);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const { user } = useAuth();
  const { works, loading, refetch, addWork, updateWork, deleteWork } = useWorks();

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const currentUserId = user?.id || storedUser?.id || storedUser?.username;

  const rawList = Array.isArray(works) 
    ? works 
    : (works?.results && Array.isArray(works.results) ? works.results : []);

  const normalizedList = rawList.map(w => normalizeWork(w, currentUserId)).filter(Boolean);

  // 👈 فیلتر اختصاصی: فقط آثاری که متعلق به خود کاربر لاگین شده هستند انتخاب می‌شوند
  const userWorksOnly = normalizedList.filter(work => {
    if (!currentUserId) return true;
    return String(work.artistId) === String(currentUserId);
  });

  const songsOnly = userWorksOnly.filter(w => w.type === 'single');
  const albumsOnly = userWorksOnly.filter(w => w.type === 'album');

  // اتصال آهنگ‌های مرتبط به آلبوم و جلوگیری از نمایش مجدد آن به عنوان تک‌آهنگ
  const myWorks = albumsOnly.map(album => {
    const matchingSongs = songsOnly.filter(s => {
      const sAlbumId = typeof s.album === 'object' && s.album !== null ? s.album.id : (s.album || s.album_id);
      return String(sAlbumId) === String(album.id);
    });

    const existingTrackIds = new Set((album.tracks || []).map(t => String(t.id)));
    const extraTracks = matchingSongs.filter(s => !existingTrackIds.has(String(s.id)));
    const allTracks = [...(album.tracks || []), ...extraTracks];

    return {
      ...album,
      tracks: allTracks,
      track_count: allTracks.length
    };
  });

  const standaloneSingles = songsOnly.filter(s => {
    const sAlbumId = typeof s.album === 'object' && s.album !== null ? s.album.id : (s.album || s.album_id);
    return !sAlbumId;
  });

  const finalWorks = [...myWorks, ...standaloneSingles];

  const handleEdit = (work) => {
    setEditingWork(normalizeWork(work, currentUserId));
    setActiveTab('upload');
  };

  const cancelEditing = () => {
    setEditingWork(null);
    setActiveTab('list');
  };

  const handleAddWork = async (workData) => {
    try {
      setUploadError('');

      if (workData.type === 'album') {
        const albumFormData = new FormData();
        albumFormData.append('title', workData.title);
        if (workData.genre) albumFormData.append('genre', workData.genre);
        if (workData.releaseDate) albumFormData.append('release_date', workData.releaseDate);
        if (workData.collaborators) albumFormData.append('featured_artist_names', workData.collaborators);
        if (workData.coverFile) albumFormData.append('cover_image', workData.coverFile);

        const createdAlbum = await createAlbum(albumFormData);
        const albumId = createdAlbum.id || createdAlbum.pk;

        if (Array.isArray(workData.tracks) && workData.tracks.length > 0) {
          for (const track of workData.tracks) {
            if (!track.title) continue;
            const songFormData = new FormData();
            songFormData.append('title', track.title);
            songFormData.append('album', albumId);
            if (workData.genre) songFormData.append('genre', workData.genre);
            if (workData.releaseDate) songFormData.append('release_date', workData.releaseDate);
            if (track.lyrics || workData.lyrics) songFormData.append('lyrics', track.lyrics || workData.lyrics);
            if (workData.collaborators) songFormData.append('featured_artist_names', workData.collaborators);
            if (workData.coverFile) songFormData.append('cover_image', workData.coverFile);

            if (track.audioFile) {
              songFormData.append('audio_file', track.audioFile);
            } else if (track.audioUrl) {
              songFormData.append('audio_file', track.audioUrl);
            }

            try {
              await createSong(songFormData);
            } catch (tErr) {
              console.error('Error uploading track:', track.title, tErr);
            }
          }
        }
      } else {
        const songFormData = new FormData();
        songFormData.append('title', workData.title);
        if (workData.genre) songFormData.append('genre', workData.genre);
        if (workData.releaseDate) songFormData.append('release_date', workData.releaseDate);
        if (workData.lyrics) songFormData.append('lyrics', workData.lyrics);
        if (workData.collaborators) songFormData.append('featured_artist_names', workData.collaborators);
        if (workData.albumId || workData.album) songFormData.append('album', workData.albumId || workData.album);
        if (workData.coverFile) songFormData.append('cover_image', workData.coverFile);
        if (workData.audioFile) songFormData.append('audio_file', workData.audioFile);

        await createSong(songFormData);
      }

      if (typeof refetch === 'function') {
        await refetch();
      }
      setActiveTab('list');
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.response?.data?.detail || err.message || 'آپلود اثر با خطا مواجه شد.');
    }
  };

  const handleUpdateWork = async (workData) => {
    try {
      setErrorMessage('');

      if (workData.type === 'album') {
        const albumFormData = new FormData();
        if (workData.title) albumFormData.append('title', workData.title);
        if (workData.genre) albumFormData.append('genre', workData.genre);
        if (workData.releaseDate) albumFormData.append('release_date', workData.releaseDate);
        if (workData.collaborators) albumFormData.append('featured_artist_names', workData.collaborators);
        if (workData.coverFile) albumFormData.append('cover_image', workData.coverFile);

        await updateAlbum(workData.id, albumFormData);

        if (Array.isArray(workData.tracks)) {
          for (const track of workData.tracks) {
            const songFormData = new FormData();
            if (track.title) songFormData.append('title', track.title);
            if (track.lyrics !== undefined) songFormData.append('lyrics', track.lyrics || '');

            if (track.audioFile && (!track.id || typeof track.id !== 'number')) {
              songFormData.append('album', workData.id);
              if (workData.genre) songFormData.append('genre', workData.genre);
              if (workData.releaseDate) songFormData.append('release_date', workData.releaseDate);
              if (workData.collaborators) songFormData.append('featured_artist_names', workData.collaborators);
              if (workData.coverFile) songFormData.append('cover_image', workData.coverFile);
              songFormData.append('audio_file', track.audioFile);

              await createSong(songFormData);
            } else if (track.id) {
              await updateSong(track.id, songFormData);
            }
          }
        }
      } else {
        const songFormData = new FormData();
        if (workData.title) songFormData.append('title', workData.title);
        if (workData.genre) songFormData.append('genre', workData.genre);
        if (workData.releaseDate) songFormData.append('release_date', workData.releaseDate);
        if (workData.lyrics !== undefined) songFormData.append('lyrics', workData.lyrics);
        if (workData.collaborators) songFormData.append('featured_artist_names', workData.collaborators);
        if (workData.albumId || workData.album) songFormData.append('album', workData.albumId || workData.album);
        if (workData.coverFile) songFormData.append('cover_image', workData.coverFile);
        if (workData.audioFile) songFormData.append('audio_file', workData.audioFile);

        await updateSong(workData.id, songFormData);
      }

      if (typeof refetch === 'function') {
        await refetch();
      }
      cancelEditing();
    } catch (err) {
      console.error('Update failed:', err);
      setErrorMessage(err.response?.data?.detail || 'خطا در به‌روزرسانی اثر.');
    }
  };

  const handleDeleteWork = async (workId) => {
    const targetWork = finalWorks.find(w => String(w.id) === String(workId));
    if (!window.confirm('آیا از حذف این اثر اطمینان دارید؟')) return;

    try {
      setErrorMessage('');
      if (targetWork?.type === 'album') {
        await deleteAlbum(workId);
      } else {
        await deleteSong(workId);
      }

      if (typeof refetch === 'function') {
        await refetch();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setErrorMessage('خطا در حذف اثر از سرور.');
    }
  };

  return (
    <div className="home-layout">
      <Sidebar />
      
      <main className={styles.dashboard}>
        <header className={styles.header}>
          <h1>
            <MusicIcon size={32} color="var(--primary-accent)" />
            Artist Dashboard
          </h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user?.name || storedUser?.name || 'Artist'}!</span>
          </div>
        </header>

        {(uploadError || errorMessage) && (
          <div style={{ color: '#d9534f', padding: '10px 15px', marginBottom: '15px', backgroundColor: '#fdf7f7', borderRadius: '6px', border: '1px solid #d9534f' }}>
            {uploadError || errorMessage}
          </div>
        )}

        <nav className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`} 
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`} 
            onClick={() => { setEditingWork(null); setActiveTab('upload'); }}
          >
            {editingWork ? 'Edit Work' : 'Upload New Work'}
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`} 
            onClick={() => setActiveTab('list')}
          >
            My Works
          </button>
        </nav>

        <section className={styles.tabContent}>
          {activeTab === 'stats' && <WorkStats works={finalWorks} />}
          {activeTab === 'upload' && (
            <UploadWork
              onAdd={handleAddWork}
              onUpdate={handleUpdateWork}
              onCancel={cancelEditing}
              editData={editingWork}
              albums={albumsOnly}
            />
          )}
          {activeTab === 'list' && (
            <MyWorksList 
              works={finalWorks} 
              onDelete={handleDeleteWork} 
              onEdit={handleEdit} 
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default ArtistDashboard;