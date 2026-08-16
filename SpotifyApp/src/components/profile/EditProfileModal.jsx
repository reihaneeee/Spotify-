// src/components/profile/EditProfileModal.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileModal({ onClose, onUpdateSuccess }) {
  const { user, updateUser } = useAuth();
  
  // خواندن مقدار نام از تمام فیلدهای احتمالی
  const [displayName, setDisplayName] = useState(
    user?.display_name || user?.artist_name || user?.displayName || user?.first_name || ''
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isArtist = user?.role === 'artist';
  const isBasic = user?.subscription?.tier === 'basic' || user?.subscription === 'basic';
  const cannotChangeAvatar = isBasic && !isArtist;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const data = new FormData();
    // ارسال تمام فیلدهای احتمالی نام برای پشتیبانی کامل در بک‌اند
    data.append('display_name', displayName);
    data.append('artist_name', displayName);
    data.append('first_name', displayName);
    data.append('bio', bio);

    if (avatarFile) {
      if (cannotChangeAvatar) {
        setErrorMsg('Basic plan users cannot change their profile picture.');
        return;
      }
      data.append('avatar', avatarFile);
    }

    try {
      const updatedUser = await updateUser(data);
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      const backendError = error?.response?.data?.avatar?.[0] || error?.response?.data?.detail;
      setErrorMsg(backendError || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Edit Profile</h2>

        {errorMsg && (
          <div style={{ color: '#f44336', marginBottom: '10px', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Profile Picture</label>
            <input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
            {cannotChangeAvatar && (
              <small className="help-text" style={{ color: '#f44336', display: 'block', marginTop: '4px' }}>
                Basic plan users cannot change their avatar. Upgrade to Silver or Gold.
              </small>
            )}
          </div>

          <div className="modal-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}