// src/utils/notificationEngine.js

/**
 * Global function to create and store system notifications in LocalStorage
 */

export const createSystemNotification = ({ targetEmail, role, text, link = null, workData = null, workType = null }) => {
  const allNotifications = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
  
  // Guaranteeing 100% unique ID using timestamp, random number, and array length
  const uniqueId = `nt_${Date.now()}_${Math.floor(Math.random() * 1000000)}_${allNotifications.length}`;

  const newNotification = {
    id: uniqueId, 
    targetEmail: targetEmail || null,
    role: role,
    text: text,
    link: link,
    workData: workData, // 👈 ذخیره دیتا برای پخش صوتی یا نمایش آلبوم
    workType: workType,
    read: false,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('spotify_notifications', JSON.stringify([newNotification, ...allNotifications]));
};

// ==========================================
// Scenario 1: Subscription Alert for regular users (Updated per request)
// ==========================================
export const triggerSubscriptionExpiryNotification = (userEmail) => {
  createSystemNotification({
    targetEmail: userEmail,
    role: 'listener',
    // 👈 متنی که دقیقاً خواسته بودی: شما اشتراک ندارید لطفا برای دسترسی... تهیه کنید
    text: '⚠️ Subscription Status: You do not have an active subscription. Please purchase a subscription plan to unlock and access all premium features.',
    link: '/settings' 
  });
};

// ==========================================
// Scenario 2: New release notification sent to artist followers
// ==========================================
// 🛠️ ارسال نوتیفیکیشن هوشمند شامل نوع اثر (single یا album) و دیتا جهت پخش یا انتقال
export const triggerNewReleaseNotification = (followerEmail, artistName, artistId, workData) => {
  const isAlbum = workData.type === 'album';
  
  createSystemNotification({
    targetEmail: followerEmail,
    role: 'listener',
    text: `🎵 New Release: Your favorite artist "${artistName}" published a new ${isAlbum ? 'album' : 'single'} "${workData.title}"!`,
    // ذخیره نوع و اطلاعات اثر درون نوتیفیکیشن
    workType: workData?.type || 'single',
    workData: workData,
    link: isAlbum ? `/albums` : null // برای آلبوم لینک انتقال و برای تک‌آهنگ پخش مستقیم
  });
};

export const notifyFollowersAboutNewRelease = (artistId, artistName, linkId, workData) => {
  // ۱. خوندن تمام کاربران سیستم از localStorage
  const allUsers = JSON.parse(localStorage.getItem('users') || '[]');

  // ۲. پیدا کردن کاربرانی که این آرتیست رو فالو دارند
  const followers = allUsers.filter(user => {
    if (!user.following) return false;
    
    // اگر following یک آرایه از آیدی‌ها باشد
    if (Array.isArray(user.following)) {
      return user.following.includes(artistId) || user.following.includes(artistName);
    }
    
    // اگر following یک آیدی تک باشد
    return user.following === artistId || user.following === artistName;
  });

  // ۳. ارسال اعلان به تک تک فالوورها
  followers.forEach(follower => {
    if (follower.email) {
      triggerNewReleaseNotification(follower.email, artistName, artistId, workData); //[cite: 13]
    }
  });

  console.log(`✅ Notification sent to ${followers.length} follower `);
};

// ==========================================
// Scenario 3: Verification status response for artists (Accept / Reject)
// ==========================================
export const triggerArtistStatusNotification = (artistEmail, isAccepted, reason = "") => {
  const text = isAccepted
    ? '🎉 Verification Approved: Your artist account verification request has been accepted. You can now publish your music!'
    : `❌ Verification Rejected: Your artist request was declined. Reason: ${reason || 'Submitted documents do not match our platform policies.'}`;

  createSystemNotification({
    targetEmail: artistEmail,
    role: 'artist',
    text: text,
    link: isAccepted ? '/profile' : '/settings'
  });
};

// ==========================================
// Scenario 4: Financial update notification for artists
// ==========================================
export const triggerFinancialUpdateNotification = (artistEmail, monthName) => {
  createSystemNotification({
    targetEmail: artistEmail,
    role: 'artist',
    text: `💰 Financial Update: Royalty earnings calculations for (${monthName}) are completed and ready for payout.`,
    link: '/profile' 
  });
};

// ==========================================
// Scenario 5: New ticket submitted by user for admins/support
// ==========================================
export const triggerNewTicketNotification = (userId, ticketSubject) => {
  createSystemNotification({
    targetEmail: null, 
    role: 'admin',      
    text: `✉️ New Ticket: User [${userId}] has submitted a new ticket with subject: "${ticketSubject}".`,
    link: '/admin'     
  });
};

// ==========================================
// Scenario 6: Artist verification request for admins
// ==========================================
export const triggerArtistSignupNotification = (artistId, artistName) => {
  createSystemNotification({
    targetEmail: null, 
    role: 'admin',
    text: `🔍 Verification Request: New artist "${artistName}" with ID [${artistId}] has registered and requested document review.`,
    link: '/admin'     
  });
};