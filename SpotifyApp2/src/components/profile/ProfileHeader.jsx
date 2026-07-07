// src/components/profile/ProfileHeader.jsx

const SUBSCRIPTION_LABELS = {
  basic: 'Basic',
  silver: 'Silver',
  gold: 'Gold',
};

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=1db954&color=fff&size=160';

export default function ProfileHeader({ user, following, onFollowToggle, onEdit }) {

  const mainName = user.userType === 'artist' 
    ? (user.artistName || user.username) 
    : (user.displayName || user.username);
    
  const subscription = user.subscription || 'basic';

  const joinedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const getDomainName = (urlString) => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  return (
    <header className="profile-header">
      <div className="profile-avatar-wrap">
        <img
          className="profile-avatar"
          src={user.avatar || DEFAULT_AVATAR.replace('User', mainName.charAt(0))}
          alt={mainName}
        />
      </div>

      <div className="profile-info">
        <span className="profile-kicker">
          {user.userType === 'artist' ? 'Artist Profile' : 'Profile'}
        </span>
        
        <h1 className="profile-name">
          {mainName}

          {user.userType === 'artist' && user.isVerified && (
            <span className="verified-badge-inline" title="Verified Artist">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.814.5a1.658 1.658 0 012.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 011.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 01-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 01-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 01-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 010-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 011.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 00-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 00-1.414 1.414l3.308 3.308 7.425-7.425z"/>
              </svg>
            </span>
          )}
        </h1>

        <div className="profile-meta">

          <span className="profile-username">@{user.username}</span>
          <span className={`subscription-badge subscription-${subscription}`}>
            {SUBSCRIPTION_LABELS[subscription]} Plan
          </span>
          <span className="profile-joined">• Joined {joinedDate}</span>
        </div>

        {user.userType === 'artist' && user.bio && (
          <p className="profile-bio">{user.bio}</p>
        )}

        {user.userType === 'artist' && user.portfolioLinks && user.portfolioLinks.length > 0 && (
          <div className="profile-links">
            {user.portfolioLinks.map((link, index) => {
              if (!link.trim()) return null;
              return (
                <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                  🔗 {getDomainName(link)}
                </a>
              );
            })}
          </div>
        )}

        <div className="profile-social">
          <span>
            <strong>{user.followers ?? 0}</strong> Followers
          </span>
          <span>
            <strong>{user.following ?? 0}</strong> Following
          </span>
        </div>

        {onFollowToggle && (
           <button
             className={`btn-follow ${following ? 'following' : ''}`}
             onClick={onFollowToggle}
           >
             {following ? 'Following' : 'Follow'}
           </button>
        )}

        {!onFollowToggle && (
          <button className="btn-edit-profile" onClick={onEdit}>
            Edit profile
          </button>
        )}

      </div>
    </header>
  );
}