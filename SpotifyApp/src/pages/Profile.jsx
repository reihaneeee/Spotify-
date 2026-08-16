// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../components/home/Sidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import '../styles/profile.css';

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayedUser, setDisplayedUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  useEffect(() => {
    const selectedArtist = localStorage.getItem('selected_artist_view');
    
    if (selectedArtist) {
      const artistData = JSON.parse(selectedArtist);
      setDisplayedUser(artistData);
      setIsOwnProfile(currentUser?.id === artistData.id || currentUser?.username === artistData.id);
    } else {
      setDisplayedUser(currentUser);
      setIsOwnProfile(true);
    }

    return () => {
      localStorage.removeItem('selected_artist_view');
    };
  }, [currentUser]);

  // دریافت اطلاعات آپدیت‌شده و اعمال مستقیم روی استیت کامپوننت
  const handleUpdateSuccess = (updatedData) => {
    if (updatedData) {
      setDisplayedUser(updatedData);
    } else if (currentUser) {
      setDisplayedUser(currentUser);
    }
  };

  if (!displayedUser) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="profile-page">
          <p className="profile-empty">No user found. Please log in.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="profile-page">
        <ProfileHeader 
          user={displayedUser} 
          onEdit={isOwnProfile ? () => setIsEditing(true) : null} 
        />
        
        <ProfileStats user={displayedUser} />

        {isEditing && isOwnProfile && (
          <EditProfileModal 
            onClose={() => setIsEditing(false)}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </main>
    </div>
  );
}