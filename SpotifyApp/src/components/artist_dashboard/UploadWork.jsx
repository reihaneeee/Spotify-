// src/pages/ArtistDashboard/UploadWork.jsx
import { useState, useRef, useEffect } from 'react';
import styles from '../../styles/UploadWork.module.css';
import {
  FolderUploadIcon,
  WarningIcon,
  SpinnerIcon,
  UploadIcon,
  AudioIcon,
  CloseIcon,
} from '../icons';

const UploadWork = ({ onAdd, onUpdate, onCancel, editData }) => {
  const isEditing = !!editData;

  const [formData, setFormData] = useState({
    title: '',
    type: 'single',
    genre: '',
    releaseDate: '',
    collaborators: '',
    lyrics: '',
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  
  // استیت‌های مربوط به تک‌آهنگ
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // فیلد جدید برای URL
  const [isAudioDragOver, setIsAudioDragOver] = useState(false);

  // استیت‌های مربوط به ترک‌های آلبوم
  const [albumTracks, setAlbumTracks] = useState([
    { id: Date.now(), title: '', audioFileName: '', audioUrl: '', audioData: '', lyrics: '' }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        type: editData.type || 'single',
        genre: editData.genre || '',
        releaseDate: editData.releaseDate || '',
        collaborators: editData.collaborators || '',
        lyrics: editData.lyrics || '',
      });
      setCoverPreview(editData.cover || '');
      setCoverUrl(editData.cover || '');
      
      // بازیابی اطلاعات بر اساس نوع
      if (editData.type === 'album' && editData.tracks) {
        setAlbumTracks(editData.tracks);
      } else {
        setAudioPreview(editData.audioData || '');
        setAudioFileName(editData.audioFileName || '');
        setAudioUrl(editData.audioUrl || '');
      }
    }
  }, [editData]);

  // --- هندلرهای تصویر کاور (بدون تغییر نسبت به کد شما) ---
  const handleCoverSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    setError('');
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCoverInputChange = (e) => { const file = e.target.files[0]; if (file) handleCoverSelect(file); };
  const handleCoverDragOver = (e) => { e.preventDefault(); setIsCoverDragOver(true); };
  const handleCoverDragLeave = (e) => { e.preventDefault(); setIsCoverDragOver(false); };
  const handleCoverDrop = (e) => { e.preventDefault(); setIsCoverDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleCoverSelect(file); };

  const handleCoverUrlChange = (e) => {
    const url = e.target.value;
    setCoverUrl(url);
    if (url) { setCoverPreview(url); setCoverFile(null); } 
    else { setCoverPreview(coverFile ? URL.createObjectURL(coverFile) : ''); }
  };

  const clearCover = () => { setCoverFile(null); setCoverPreview(''); setCoverUrl(''); if (coverInputRef.current) coverInputRef.current.value = ''; };

  // --- هندلرهای تک‌آهنگ ---
  const handleAudioSelect = (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-flac'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, FLAC)');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Audio file must be less than 20MB');
      return;
    }
    setError('');
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(''); // پاک کردن URL اگر فایل آپلود شد
    const reader = new FileReader();
    reader.onloadend = () => setAudioPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAudioInputChange = (e) => { const file = e.target.files[0]; if (file) handleAudioSelect(file); };
  const handleAudioDragOver = (e) => { e.preventDefault(); setIsAudioDragOver(true); };
  const handleAudioDragLeave = (e) => { e.preventDefault(); setIsAudioDragOver(false); };
  const handleAudioDrop = (e) => { e.preventDefault(); setIsAudioDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleAudioSelect(file); };

  const clearAudio = () => { setAudioFile(null); setAudioPreview(''); setAudioFileName(''); setAudioUrl(''); if (audioInputRef.current) audioInputRef.current.value = ''; };

  // --- هندلرهای چند آهنگ (آلبوم) ---
  const handleTrackChange = (id, field, value) => {
    setAlbumTracks(albumTracks.map(track => track.id === id ? { ...track, [field]: value } : track));
  };

  const handleTrackFileSelect = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAlbumTracks(albumTracks.map(track => track.id === id ? { ...track, audioData: reader.result, audioFileName: file.name, audioUrl: '' } : track));
    };
    reader.readAsDataURL(file);
  };

  const addTrack = () => setAlbumTracks([...albumTracks, { id: Date.now(), title: '', audioFileName: '', audioUrl: '', audioData: '', lyrics: '' }]);
  const removeTrack = (id) => setAlbumTracks(albumTracks.filter(track => track.id !== id));

  // --- Form Submission ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    // اعتبارسنجی فایل‌های صوتی
    if (formData.type === 'single') {
      if (!audioFileName && !audioUrl && !isEditing) {
        setError('Audio file or URL is required for singles.');
        return;
      }
    } else {
      const invalidTrack = albumTracks.find(t => !t.title.trim() || (!t.audioFileName && !t.audioUrl && !t.audioData));
      if (invalidTrack) {
        setError('All album tracks must have a title and audio (File or URL).');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    // دریافت نام هنرمند از نشست فعال (برای حل مشکل Unknown Artist)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const artistName = currentUser.artistName || currentUser.displayName || currentUser.username || 'Unknown Artist';
    const artistId = currentUser.id || currentUser.username;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          const workData = {
            ...formData,
            artistName, // نام واقعی هنرمند ذخیره می‌شود
            artistId,
            cover: coverPreview || '', 
            coverFile: coverFile,
            plays: editData?.plays || 0,
            listeners: editData?.listeners || 0,
            revenue: editData?.revenue || 0,
          };

          if (formData.type === 'single') {
            workData.audioData = audioPreview || '';
            workData.audioFileName = audioFileName || '';
            workData.audioUrl = audioUrl || '';
            workData.tracks = null;
          } else {
            workData.tracks = albumTracks;
            workData.audioData = ''; 
          }

          if (isEditing) {
            onUpdate({ ...editData, ...workData });
          } else {
            onAdd(workData);
          }

          setIsUploading(false);
          setUploadProgress(0);

          if (!isEditing) {
            setFormData({ title: '', type: 'single', genre: '', releaseDate: '', collaborators: '', lyrics: '' });
            clearCover();
            clearAudio();
            setAlbumTracks([{ id: Date.now(), title: '', audioFileName: '', audioUrl: '', audioData: '', lyrics: '' }]);
          }
        }, 300);
      }
      setUploadProgress(progress);
    }, 200);
  };

  return (
    <form className={styles.uploadForm} onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Work' : 'Upload New Work'}</h2>

      {error && (
        <div className={styles.errorMessage}>
          <WarningIcon size={20} className={styles.warningIcon} />
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Work Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter work title" required />
      </div>

      <div className={styles.formGroup}>
        <label>Release Type</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="single">Single</option>
          <option value="album">Album</option>
        </select>
      </div>

      {/* Cover Drag & Drop */}
      <div className={styles.formGroup}>
        <label>Cover Image (optional)</label>
        <div
          className={`${styles.dropZone} ${isCoverDragOver ? styles.dragOver : ''}`}
          onDragOver={handleCoverDragOver}
          onDragLeave={handleCoverDragLeave}
          onDrop={handleCoverDrop}
          onClick={() => coverInputRef.current?.click()}
        >
          {coverPreview ? (
            <div className={styles.previewContainer}>
              <img src={coverPreview} alt="Cover preview" className={styles.previewImage} />
              <button type="button" className={styles.removeImage} onClick={(e) => { e.stopPropagation(); clearCover(); }}>
                <CloseIcon size={16} color="#fff" />
              </button>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <FolderUploadIcon size={48} className={styles.dropIcon} />
              <p>Drag & drop your cover image here</p>
              <p className={styles.dropHint}>or click to browse</p>
              <p className={styles.dropFormat}>Supported: JPEG, PNG, WebP (Max 5MB)</p>
            </div>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverInputChange} style={{ display: 'none' }} />
        </div>
        <div className={styles.orDivider}>— OR —</div>
        <div className={styles.urlInputWrapper}>
          <input type="url" placeholder="Or paste image URL here" value={coverUrl} onChange={handleCoverUrlChange} className={styles.urlInput} />
        </div>
      </div>

      {/* رندر شرطی: سینگل یا آلبوم */}
      {formData.type === 'single' ? (
        <div className={styles.formGroup}>
          <label>Audio File (MP3, WAV, FLAC, or URL) {!isEditing && '*'}</label>
          <div
            className={`${styles.dropZone} ${isAudioDragOver ? styles.dragOver : ''}`}
            onDragOver={handleAudioDragOver}
            onDragLeave={handleAudioDragLeave}
            onDrop={handleAudioDrop}
            onClick={() => audioInputRef.current?.click()}
          >
            {audioFileName ? (
              <div className={styles.audioPreviewContainer}>
                <AudioIcon size={32} color="var(--primary-accent)" />
                <span className={styles.audioFileName}>{audioFileName}</span>
                <button type="button" className={styles.removeImage} onClick={(e) => { e.stopPropagation(); clearAudio(); }}>
                  <CloseIcon size={16} color="#fff" />
                </button>
              </div>
            ) : (
              <div className={styles.dropContent}>
                <AudioIcon size={40} className={styles.dropIcon} />
                <p>Drag & drop your audio file here</p>
                <p className={styles.dropHint}>or click to browse</p>
                <p className={styles.dropFormat}>Supported: MP3, WAV, FLAC (Max 20MB)</p>
              </div>
            )}
            <input ref={audioInputRef} type="file" accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac" onChange={handleAudioInputChange} style={{ display: 'none' }} />
          </div>
          <div className={styles.orDivider}>— OR —</div>
          <div className={styles.urlInputWrapper}>
            <input type="url" placeholder="Or paste audio URL here" value={audioUrl} onChange={(e) => { setAudioUrl(e.target.value); setAudioFile(null); setAudioFileName(''); }} className={styles.urlInput} />
          </div>
          {audioPreview && !audioFile && !audioUrl && (
            <div className={styles.audioPreviewInfo}>
              <AudioIcon size={20} color="var(--primary-accent)" />
              <span>Audio file loaded from storage</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label>Album Tracks *</label>
          {albumTracks.map((track, index) => (
            <div key={track.id} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: '#fff' }}>Track {index + 1}</h4>
                {albumTracks.length > 1 && (
                  <button type="button" onClick={() => removeTrack(track.id)} style={{ background: 'none', border: 'none', color: '#e22134', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                )}
              </div>
              <input type="text" placeholder="Track Title *" value={track.title} onChange={(e) => handleTrackChange(track.id, 'title', e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '4px', color: '#fff' }} required />
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="url" placeholder="Audio URL" value={track.audioUrl} onChange={(e) => { handleTrackChange(track.id, 'audioUrl', e.target.value); handleTrackChange(track.id, 'audioFileName', ''); }} style={{ flex: 1, padding: '0.75rem', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '4px', color: '#fff' }} />
                <span style={{ color: '#b3b3b3', alignSelf: 'center' }}>OR</span>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type="file" accept="audio/*" id={`file-${track.id}`} style={{ display: 'none' }} onChange={(e) => handleTrackFileSelect(track.id, e.target.files[0])} />
                  <label htmlFor={`file-${track.id}`} style={{ display: 'block', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '4px', color: '#fff', cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.audioFileName || 'Choose File...'}
                  </label>
                </div>
              </div>
              <textarea placeholder="Lyrics (optional)" value={track.lyrics} onChange={(e) => handleTrackChange(track.id, 'lyrics', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '4px', color: '#fff', minHeight: '60px', resize: 'vertical' }} />
            </div>
          ))}
          <button type="button" onClick={addTrack} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed #4a4a4a', color: '#b3b3b3', borderRadius: '8px', cursor: 'pointer' }}>+ Add Another Track</button>
        </div>
      )}

      {/* فیلدهای مشترک و پایانی */}
      <div className={styles.formGroup}>
        <label>Genre</label>
        <input type="text" name="genre" value={formData.genre} onChange={handleChange} placeholder="e.g. Pop, Rock, Classical" />
      </div>

      <div className={styles.formGroup}>
        <label>Release Date</label>
        <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className={styles.dateInput} />
      </div>

      <div className={styles.formGroup}>
        <label>Collaborators</label>
        <input type="text" name="collaborators" value={formData.collaborators} onChange={handleChange} placeholder="Artist1, Artist2 (comma separated)" />
      </div>

      {/* نمایش فیلد Lyrics کلی فقط برای سینگل */}
      {formData.type === 'single' && (
        <div className={styles.formGroup}>
          <label>Lyrics (optional)</label>
          <textarea name="lyrics" rows="4" value={formData.lyrics} onChange={handleChange} placeholder="Enter lyrics here..." />
        </div>
      )}

      {isUploading && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className={styles.progressText}>{uploadProgress}%</span>
        </div>
      )}

      <div className={styles.formActions}>
        {isEditing && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitBtn} disabled={isUploading}>
          {isUploading ? (
            <>
              <SpinnerIcon size={20} className="icon-spin" />
              {isEditing ? 'Updating...' : 'Publishing...'}
            </>
          ) : (
            <>
              <UploadIcon size={20} className={styles.actionIcon} />
              {isEditing ? 'Update Work' : 'Publish Work'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UploadWork;