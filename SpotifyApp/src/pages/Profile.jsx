import { useState } from 'react';
import Sidebar from '../components/home/Sidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import '../styles/profile.css';

export default function Profile() {
  const { user } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false);
  
  // For phase 2
  //const isOwnProfile = true; 
  if (!user) {
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
        <ProfileHeader user={user} onEdit={() => setIsEditing(true)} />
          {/* Pass following and onFollowToggle if needed
              For own profile, we don't pass them
          */} 
          <ProfileStats user={user} />

        {isEditing && (
          <EditProfileModal onClose={() => setIsEditing(false)}/>
        )}
      </main>
    </div>
  );
}