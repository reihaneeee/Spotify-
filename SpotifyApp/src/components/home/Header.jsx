// src/components/home/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth(); // Get user from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const nameForInitials = user.displayName || user.artistName || user.username;
  const initials = nameForInitials
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // FIXED: Do not assign a default value here, as it will be overwritten immediately.
  let displayName;
  if (user.userType === 'artist') {
    displayName = user.artistName || user.username;
  } else {
    displayName = user.displayName || user.username;
  }

  return (
    <div className="header">
      <div className="header-left">
        {/* Optional navigation buttons can go here */}
      </div>
      
      <div className="header-right">
        <Link to="/profile" className="user-info">
          <div className="user-avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt={displayName} />
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