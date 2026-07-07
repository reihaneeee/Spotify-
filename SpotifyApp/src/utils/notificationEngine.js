// src/utils/notificationEngine.js

/**
 * تابع پایه و سراسری برای ساخت و ذخیره یک اعلان در LocalStorage پلتفرم
 */
// src/utils/notificationEngine.js

export const createSystemNotification = ({ targetEmail, role, text, link = null }) => {
  const allNotifications = JSON.parse(localStorage.getItem('spotify_notifications') || '[]');
  
  // حل مشکل کلید تکراری: ترکیب زمان دقیق، یک عدد تصادفی بزرگتر و طول آرایه برای تضمین ۱۰۰٪ یکتا بودن
  const uniqueId = `nt_${Date.now()}_${Math.floor(Math.random() * 1000000)}_${allNotifications.length}`;

  const newNotification = {
    id: uniqueId, // آیدی کاملاً منحصربه‌فرد و ایمن
    targetEmail: targetEmail || null,
    role: role,
    text: text,
    link: link,
    read: false,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('spotify_notifications', JSON.stringify([newNotification, ...allNotifications]));
};

// ==========================================
// سناریو ۱: اعلان اتمام اشتراک برای کاربر عادی
// ==========================================
export const triggerSubscriptionExpiryNotification = (userEmail) => {
  createSystemNotification({
    targetEmail: userEmail,
    role: 'listener',
    text: '⚠️ هشدار مهلت اشتراک: مهارت اشتراک ویژه شما به اتمام رسیده است. جهت تمدید و دسترسی نامحدود به بخش اشتراک‌ها مراجعه کنید.',
    link: '/settings' // یا لینک صفحه ارتقای اشتراک شما
  });
};

// ==========================================
// سناریو ۲: اعلان انتشار آهنگ جدید به فالوورهای هنرمند
// ==========================================
export const triggerNewReleaseNotification = (followerEmail, artistName, artistId, songTitle) => {
  createSystemNotification({
    targetEmail: followerEmail,
    role: 'listener',
    text: `🎵 اثر جدید: هنرمند مورد علاقه شما "${artistName}" قطعه جدیدی به نام "${songTitle}" منتشر کرد!`,
    link: `/artist/${artistId}` // لینک مستقیم به صفحه پروفایل هنرمند طبق نیازمندی
  });
};

// ==========================================
// سناریو ۳: اعلان نتیجه بررسی احراز هویت به هنرمند (تایید یا رد با علت)
// ==========================================
export const triggerArtistStatusNotification = (artistEmail, isAccepted, reason = "") => {
  const text = isAccepted
    ? '🎉 تایید حساب: درخواست احراز هویت شما تایید شد! حساب کاربری هنری شما فعال گردید و اکنون می‌توانید آثار خود را منتشر کنید.'
    : `❌ رد درخواست: درخواست احراز هویت شما رد شد. علت: ${reason || 'عدم تطابق مدارک ارسالی با سیاست‌های پلتفرم.'}`;

  createSystemNotification({
    targetEmail: artistEmail,
    role: 'artist',
    text: text,
    link: isAccepted ? '/profile' : '/settings'
  });
};

// ==========================================
// سناریو ۴: اعلان آپدیت محاسبات مالی جدید به هنرمند
// ==========================================
export const triggerFinancialUpdateNotification = (artistEmail, monthName) => {
  createSystemNotification({
    targetEmail: artistEmail,
    role: 'artist',
    text: `💰 اعلان مالی: محاسبات پاداش و درآمد حاصل از استریم‌های شما مربوط به ماه (${monthName}) انجام شد و در وضعیت آماده پرداخت قرار گرفت.`,
    link: '/profile' // یا بخش ولت/درآمد در پروفایل هنرمند
  });
};

// ==========================================
// سناریو ۵: اعلان تیکت جدید از سوی کاربر عادی برای ادمین/پشتیبان
// ==========================================
export const triggerNewTicketNotification = (userId, ticketSubject) => {
  createSystemNotification({
    targetEmail: null, // عمومی برای تمام ادمین‌ها و پشتیبان‌ها
    role: 'admin',      // یا support بسته به پیاده‌سازی روت‌ها
    text: `✉️ تیکت جدید: کاربر با آیدی [${userId}] تیکت جدیدی با موضوع "${ticketSubject}" ثبت کرده است.`,
    link: '/admin'     // هدایت به داشبورد ادمین بخش تیکت‌ها
  });
};

// ==========================================
// سناریو ۶: اعلان درخواست جدید احراز هویت هنرمند برای ادمین
// ==========================================
export const triggerArtistSignupNotification = (artistId, artistName) => {
  createSystemNotification({
    targetEmail: null, // عمومی برای ادمین‌ها
    role: 'admin',
    text: `🔍 احراز هویت: هنرمند جدید "${artistName}" با آیدی [${artistId}] ثبت‌نام کرده و درخواست بررسی مدارک را دارد.`,
    link: '/admin'     // هدایت به بخش درخواست‌های در انتظار پنل مدیریت
  });
};