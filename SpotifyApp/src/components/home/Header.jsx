// src/components/home/Header.jsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // پشتیبانی همزمان از نام‌گذاری جنگو (snake_case) و فرانت‌اند (camelCase)
  const role = user.role || user.userType;
  const userDisplayName = user.display_name || user.displayName;
  const userArtistName = user.artist_name || user.artistName;
  const avatarUrl = user.avatar || user.profileImage;

  // تعیین نام نمایشی کاربر
  const displayName = role === 'artist'
    ? (userArtistName || user.username || 'User')
    : (userDisplayName || user.username || 'User');

  // محاسبه حروف اول نام (Initials)
  const nameForInitials = userDisplayName || userArtistName || user.username || 'User';
  const initials = nameForInitials
    ?.split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="header">
      <div className="header-left">
        {/* Optional navigation buttons can go here */}
      </div>
      
      <div className="header-right">
        <Link to="/profile" className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="user-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#282828', color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>
          <span className="user-name">{displayName}</span>
        </Link>
        
        <button onClick={handleLogout} className="logout-btn">
          Log out
        </button>
      </div>
    </div>
  );
}