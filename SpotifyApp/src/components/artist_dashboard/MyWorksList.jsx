// src/pages/ArtistDashboard/MyWorksList.jsx
import { useState } from 'react';
import styles from '../../styles/MyWorksList.module.css';
import { EmptyMusicIcon, EditIcon, DeleteIcon, SearchIcon, SortIcon, ArrowUpIcon, ArrowDownIcon, UserIcon, LyricsIcon, BackIcon, AudioIcon, EarIcon, PlaysIcon, MoneyBagIcon } from '../icons';
import WaveformPlayer from './WaveformPlayer';
import DefaultCover from './DefaultCover';

const MyWorksList = ({ works, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // استیت‌های نویگیشن داخلی
  const [viewMode, setViewMode] = useState('singles'); // 'singles' یا 'albums'
  const [selectedAlbum, setSelectedAlbum] = useState(null); // نگهداری آلبومی که برای دیدن ترک‌ها کلیک شده
  const [selectedWork, setSelectedWork] = useState(null); // آهنگی که در حال پخش و نمایش جزئیات است

  const filtered = works.filter((w) => w.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (sortField === 'releaseDate') { valA = new Date(valA).getTime() || 0; valB = new Date(valB).getTime() || 0; } 
    else { if (typeof valA === 'string') valA = valA.toLowerCase(); if (typeof valB === 'string') valB = valB.toLowerCase(); }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => { setSortField(field); setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'); };

  // --- نمای وضعیت خالی ---
  if (works.length === 0) {
    return (
      <div className={styles.emptyState}>
        <EmptyMusicIcon size={64} className={styles.emptyIcon} />
        <h3>No works published yet</h3>
        <p>Publish your first work!</p>
        <button className={styles.uploadBtn} onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'upload' }))}>Upload New Work</button>
      </div>
    );
  }

  // --- نمای پخش آهنگ (Detail View) ---
  if (selectedWork) {
    const hasAudio = !!(selectedWork.audioData || selectedWork.audioUrl || selectedWork.audioFileName);
    return (
      <div className={styles.detailView}>
        <button className={styles.backBtn} onClick={() => setSelectedWork(null)}>
          <BackIcon size={20} /> Back
        </button>
        <div className={styles.detailCard}>
          <div className={styles.detailCoverWrapper}>
            {selectedWork.cover ? <img src={selectedWork.cover} alt={selectedWork.title} className={styles.detailCover} /> : <DefaultCover size="large" className={styles.detailCover} />}
          </div>
          <div className={styles.detailInfo}>
            <h2>{selectedWork.title}</h2>
            <p className={styles.detailMeta}>{selectedWork.type === 'album' ? 'Album Track' : 'Single'} • {selectedWork.genre || 'No Genre'}</p>
            <p className={styles.detailMeta}>Released: {selectedWork.releaseDate || 'Unknown'}</p>

            {hasAudio ? (
              <WaveformPlayer src={selectedWork.audioData || selectedWork.audioUrl || ''} fileName={selectedWork.audioFileName || selectedWork.title} />
            ) : (<p className={styles.noAudio}>No audio file available</p>)}

            {selectedWork.lyrics && (
              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}><LyricsIcon size={18} color="var(--primary-accent)" /> Lyrics</div>
                <pre className={styles.lyricsText}>{selectedWork.lyrics}</pre>
              </div>
            )}
            <div className={styles.detailStats}>
              <span><EarIcon size={18} color="var(--primary-accent)" /> {selectedWork.listeners || 0} listeners</span>
              <span><PlaysIcon size={18} color="#2f88ff" /> {selectedWork.plays || 0} plays</span>
              <span><MoneyBagIcon size={18} color="#f5a623" /> {(selectedWork.revenue || 0).toLocaleString()} IRR</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- نمای داخل آلبوم (لیست ترک‌ها) ---
  if (selectedAlbum) {
    return (
      <div className={styles.detailView}>
         <button className={styles.backBtn} onClick={() => setSelectedAlbum(null)}>
          <BackIcon size={20} /> Back to Albums
        </button>
        <div style={{ background: '#181818', padding: '2rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '8px', overflow: 'hidden' }}>
               {selectedAlbum.cover ? <img src={selectedAlbum.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover'}} /> : <DefaultCover size="large" />}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedAlbum.title}</h2>
              <p style={{ color: '#b3b3b3', margin: 0 }}>Album • {selectedAlbum.tracks?.length || 0} Tracks</p>
            </div>
          </div>
          
          <h3 style={{ borderBottom: '1px solid #2a2a2a', paddingBottom: '0.5rem' }}>Tracklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedAlbum.tracks?.map((track, idx) => (
              <div key={track.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }} 
                   onClick={() => {
                     // ساخت یک آبجکت "تک‌آهنگ مجازی" برای پخش در Detail View
                     setSelectedWork({
                       ...track,
                       cover: selectedAlbum.cover,
                       releaseDate: selectedAlbum.releaseDate,
                       genre: selectedAlbum.genre,
                       plays: selectedAlbum.plays, // برای سادگی، آمار آلبوم رو نشون می‌دیم
                       listeners: selectedAlbum.listeners,
                       revenue: selectedAlbum.revenue,
                       type: 'single'
                     });
                   }}>
                <span style={{ fontWeight: '500' }}>{idx + 1}. {track.title}</span>
                <span style={{ color: '#1db954', fontSize: '0.9rem' }}>▶ Play</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- نمای اصلی لیست کارها (Singles / Albums) ---
  const mySingles = sorted.filter(w => w.type === 'single');
  const myAlbums = sorted.filter(w => w.type === 'album');
  const currentItems = viewMode === 'singles' ? mySingles : myAlbums;

  return (
    <div className={styles.listContainer}>
      <div className={styles.controlsBar}>
        <div style={{ display: 'flex', gap: '1rem', background: '#181818', padding: '0.5rem', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
          <button style={{ padding: '0.5rem 1rem', background: viewMode === 'singles' ? '#2a2a2a' : 'transparent', border: 'none', color: viewMode === 'singles' ? '#fff' : '#b3b3b3', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setViewMode('singles')}>Singles</button>
          <button style={{ padding: '0.5rem 1rem', background: viewMode === 'albums' ? '#2a2a2a' : 'transparent', border: 'none', color: viewMode === 'albums' ? '#fff' : '#b3b3b3', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setViewMode('albums')}>Albums</button>
        </div>

        <div className={styles.searchWrapper}>
          <SearchIcon size={20} color="var(--text-secondary)" />
          <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
        </div>
        <div className={styles.sortWrapper}>
                <SortIcon size={18} color="var(--text-secondary)" />
                <button
                  className={`${styles.sortBtn} ${sortField === 'title' ? styles.activeSort : ''}`}
                  onClick={() => toggleSort('title')}
                >
                  Title {sortField === 'title' && (sortOrder === 'asc' ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />)}
                </button>
                <button
                  className={`${styles.sortBtn} ${sortField === 'releaseDate' ? styles.activeSort : ''}`}
                  onClick={() => toggleSort('releaseDate')}
                >
                  Date {sortField === 'releaseDate' && (sortOrder === 'asc' ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />)}
                </button>
        </div>
      </div>

      <div className={styles.grid}>
        {currentItems.map((work) => (
          <div key={work.id} className={styles.card} onClick={() => work.type === 'album' ? setSelectedAlbum(work) : setSelectedWork(work)}>
            <div className={styles.coverWrapper}>
              {work.cover ? <img src={work.cover} alt={work.title} className={styles.coverImage} /> : <DefaultCover size="large" className={styles.defaultCover} />}
            </div>
            
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{work.title}</h3>
              <div className={styles.meta}>
                {work.type === 'album' ? `Album • ${work.tracks?.length || 0} Tracks` : 'Single'} • {work.genre || 'No Genre'}
              </div>
              <div className={styles.meta}>Released: {work.releaseDate || 'Unknown'}</div>
            </div>

            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
              <button className={styles.editBtn} onClick={() => onEdit(work)}><EditIcon size={16} /> Edit</button>
              <button className={styles.deleteBtn} onClick={() => onDelete(work.id)}><DeleteIcon size={16} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {currentItems.length === 0 && (
        <div className={styles.emptyStateSmall}>
          <p>No {viewMode} found.</p>
        </div>
      )}
    </div>
  );
};

export default MyWorksList;