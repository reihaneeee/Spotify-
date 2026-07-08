// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../components/home/Sidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import '../styles/profile.css';

export default function Profile() {
  const { user: currentUser } = useAuth(); // کاربر لاگین شده فعلی
  const [isEditing, setIsEditing] = useState(false);
  
  // استیت ذخیره کاربری که قرار است اطلاعاتش رندر شود
  const [displayedUser, setDisplayedUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  useEffect(() => {
    const selectedArtist = localStorage.getItem('selected_artist_view');
    
    if (selectedArtist) {
      const artistData = JSON.parse(selectedArtist);
      // اگر روی آرتیستی کلیک شده بود، دیتای او را نشان بده
      setDisplayedUser(artistData);
      // اگر آیدی آرتیست با آیدی کاربر لاگین شده یکی نبود، یعنی پروفایل خودش نیست
      setIsOwnProfile(currentUser?.id === artistData.id || currentUser?.username === artistData.id);
    } else {
      // در غیر این صورت پروفایل خود کاربر لاگین شده را نشان بده
      setDisplayedUser(currentUser);
      setIsOwnProfile(true);
    }

    // لایف‌سایکل پاک‌سازی: وقتی کاربر از این صفحه خارج شد، دیتای موقت حذف شود
    return () => {
      localStorage.removeItem('selected_artist_view');
    };
  }, [currentUser]);

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
        {/* هدر پروفایل: دکمه ادیت فقط برای پروفایل خود کاربر نمایش داده می‌شود */}
        <ProfileHeader 
          user={displayedUser} 
          onEdit={isOwnProfile ? () => setIsEditing(true) : null} 
        />
        
        <ProfileStats user={displayedUser} />

        {isEditing && isOwnProfile && (
          <EditProfileModal onClose={() => setIsEditing(false)}/>
        )}
      </main>
    </div>
  );
}