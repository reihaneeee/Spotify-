// src/components/profile/EditProfileModal.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    avatar: user.avatar || '',
  });

  // Check subscription restrictions
  const isBasic = user.subscription === 'basic';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Only update fields that are allowed
    const updates = { displayName: formData.displayName };
    
    // Basic users cannot upload avatar!
    if (!isBasic) {
      updates.avatar = formData.avatar;
    }

    updateUser(updates);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Edit Profile</h2>

        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleChange}
          />
        </div>

        {/* Avatar Field */}
        <div className="form-group">
          <label htmlFor="avatar">Profile Picture</label>
          <input
            id="avatar"
            name="avatar"
            type="text"
            placeholder="Enter image URL"
            value={formData.avatar}
            onChange={handleChange}
            disabled={isBasic}
            title={isBasic ? 'Upgrade to Silver/Gold to change avatar' : ''}
          />
          {isBasic && (
            <small className="help-text" style={{color: '#f44336'}}>
              Basic plan users cannot change their avatar. Upgrade to Silver or Gold.
            </small>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}