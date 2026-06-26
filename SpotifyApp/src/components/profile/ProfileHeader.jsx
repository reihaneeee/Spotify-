// import React from 'react';

const SUBSCRIPTION_LABELS = {
  basic: 'Basic',
  silver: 'Silver',
  gold: 'Gold',
};

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=1db954&color=fff&size=160';

export default function ProfileHeader({  user, following, onFollowToggle, onEdit}) {
  const displayName = user.displayName || user.username;
  const subscription = user.subscription || 'basic';

  return (
    <header className="profile-header">
      <div className="profile-avatar-wrap">
        <img
          className="profile-avatar"
          src={user.avatar || DEFAULT_AVATAR}
          alt={displayName}
        />
      </div>

      <div className="profile-info">
        <span className="profile-kicker">Profile</span>
        <h1 className="profile-name">{displayName}</h1>

        <div className="profile-meta">
          <span className="profile-username">@{user.username}</span>
          <span className={`subscription-badge subscription-${subscription}`}>
            {SUBSCRIPTION_LABELS[subscription]} Plan
          </span>
        </div>

        <div className="profile-social">
          <span>
            <strong>{user.followers ?? 0}</strong> Followers
          </span>
          <span>
            <strong>{user.following ?? 0}</strong> Following
          </span>
        </div>

        {/* If the user is viewing someone else's profile, show Follow button */}
        {onFollowToggle && (
           <button
             className={`btn-follow ${following ? 'following' : ''}`}
             onClick={onFollowToggle}
           >
             {following ? 'Following' : 'Follow'}
           </button>
        )}

        {/* If it's their own profile, show Edit button */}
        {!onFollowToggle && (
          <button className="btn-edit-profile" onClick={onEdit}>
            Edit profile
          </button>
        )}

      </div>
    </header>
  );
}
