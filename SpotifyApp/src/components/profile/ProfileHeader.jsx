// src/components/profile/ProfileHeader.jsx

const SUBSCRIPTION_LABELS = {
  basic: 'Basic',
  silver: 'Silver',
  gold: 'Gold',
};

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=1db954&color=fff&size=160';

export default function ProfileHeader({ user = {}, following, onFollowToggle, onEdit }) {
  // پشتیبانی همزمان از کلیدهای بک‌اند (snake_case) و فرانت‌اند (camelCase)
  const role = user.role || user.userType;
  const displayName = user.display_name || user.displayName;
  const artistName = user.artist_name || user.artistName;
  const portfolioLinks = user.portfolio_links || user.portfolioLinks || [];
  const isVerified = user.is_verified_artist || user.isVerified;
  const createdAt = user.date_joined || user.createdAt;

  // تعیین نام اصلی برای نمایش
  const mainName = role === 'artist' 
    ? (artistName || user.username || 'User') 
    : (displayName || user.username || 'User');

  // استخراج سطح اشتراک
  const subTier = (typeof user.subscription === 'object' && user.subscription !== null)
    ? (user.subscription.tier || 'basic')
    : (user.subscription || 'basic');

  const subscriptionLabel = SUBSCRIPTION_LABELS[subTier] || 'Basic';

  // تاریخ عضویت
  const joinedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const getDomainName = (urlString) => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  // محاسبه تعداد دنبال‌کنندگان
  const calculatedFollowersCount = (() => {
    if (typeof user.followers_count === 'number') return user.followers_count;
    if (typeof user.followers === 'number' && user.followers > 0) return user.followers;
    if (Array.isArray(user.followers) && user.followers.length > 0) return user.followers.length;

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    return allUsers.filter(u => {
      if (!u.following) return false;
      return Array.isArray(u.following) 
        ? u.following.includes(user.id) || u.following.includes(artistName || user.username)
        : u.following === user.id || u.following === (artistName || user.username);
    }).length;
  })();

  // محاسبه تعداد دنبال‌شوندگان
  const calculatedFollowingCount = typeof user.following_count === 'number'
    ? user.following_count
    : (Array.isArray(user.following) ? user.following.length : (user.following ?? 0));

  return (
    <header className="profile-header">
      <div className="profile-avatar-wrap">
        <img
          className="profile-avatar"
          src={user.avatar || DEFAULT_AVATAR.replace('User', encodeURIComponent(mainName.charAt(0)))}
          alt={mainName}
        />
      </div>

      <div className="profile-info">
        <span className="profile-kicker">
          {role === 'artist' ? 'Artist Profile' : 'Profile'}
        </span>
        
        <h1 className="profile-name">
          {mainName}

          {role === 'artist' && isVerified && (
            <span className="verified-badge-inline" title="Verified Artist">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.814.5a1.658 1.658 0 012.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 011.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 01-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 01-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 01-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 010-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 011.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 00-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 00-1.414 1.414l3.308 3.308 7.425-7.425z"/>
              </svg>
            </span>
          )}
        </h1>

        <div className="profile-meta">
          <span className="profile-username">@{user.username || 'username'}</span>
          <span className={`subscription-badge subscription-${subTier}`}>
            {subscriptionLabel} Plan
          </span>
          <span className="profile-joined">• Joined {joinedDate}</span>
        </div>

        {role === 'artist' && user.bio && (
          <p className="profile-bio">{user.bio}</p>
        )}

        {role === 'artist' && portfolioLinks && portfolioLinks.length > 0 && (
          <div className="profile-links">
            {portfolioLinks.map((link, index) => {
              if (typeof link !== 'string' || !link.trim()) return null;
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
            <strong>{calculatedFollowersCount}</strong> Followers
          </span>
          <span>
            <strong>{calculatedFollowingCount}</strong> Following
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