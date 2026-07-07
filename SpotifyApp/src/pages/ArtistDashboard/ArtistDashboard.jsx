// src/pages/ArtistDashboard/ArtistDashboard.jsx
import { useState } from 'react';
import styles from '../../styles/ArtistDashboard.module.css';
import UploadWork from '../../components/artist_dashboard/UploadWork';
import MyWorksList from '../../components/artist_dashboard/MyWorksList';
import WorkStats from '../../components/artist_dashboard/WorkStats';
import { MusicIcon } from '../../components/icons';
import { useWorks } from '../../hooks/useWorks';

// ۱. اضافه شدن سایدبار و کانتکست احراز هویت
import Sidebar from '../../components/home/Sidebar';
import { useAuth } from '../../context/AuthContext';

const ArtistDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [editingWork, setEditingWork] = useState(null);
  
  // ۲. گرفتن اطلاعات یوزر فعلی
  const { user } = useAuth();
  const { works, addWork, updateWork, deleteWork } = useWorks();

  // ۳. فیلتر کردن آثار: فقط کارهایی که متعلق به هنرمند لاگین‌شده است
  const myWorks = works ? works.filter(w => w.artistId === user?.id) : [];

  const handleEdit = (work) => {
    setEditingWork(work);
    setActiveTab('upload');
  };

  const cancelEditing = () => {
    setEditingWork(null);
    setActiveTab('list');
  };

  return (
    // ۴. قرار دادن کل محتوا در قالب اصلی سایت برای نمایش صحیح سایدبار
    <div className="home-layout">
      <Sidebar />
      
      {/* تغییر تگ div به main برای ساختار معنایی بهتر، ضمن حفظ کلاس استایل شما */}
      <main className={styles.dashboard}>
        <header className={styles.header}>
          <h1>
            <MusicIcon size={32} color="var(--primary-accent)" />
            Artist Dashboard
          </h1>
          <div className={styles.userInfo}>
            {/* ۵. نمایش پویای نام هنرمند */}
            <span>Welcome, {user?.name || 'Artist'}!</span>
          </div>
        </header>

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
          {/* ۶. پاس دادن آرایه فیلتر شده (myWorks) به جای کل آثار (works) */}
          {activeTab === 'stats' && <WorkStats works={myWorks} />}
          {activeTab === 'upload' && (
            <UploadWork
              onAdd={(work) => { 
                // ۷. اضافه کردن آیدی هنرمند در لحظه آپلود کار جدید
                addWork({ ...work, artistId: user?.id }); 
                setActiveTab('list'); 
              }}
              onUpdate={(work) => { updateWork(work); cancelEditing(); }}
              onCancel={cancelEditing}
              editData={editingWork}
            />
          )}
          {activeTab === 'list' && (
            <MyWorksList 
              works={myWorks} 
              onDelete={deleteWork} 
              onEdit={handleEdit} 
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default ArtistDashboard;