// src/pages/Settings.jsx

import { useState } from 'react';
import Sidebar from '../components/home/Sidebar';
import ChangePassword from '../components/settings/ChangePassword';
import DeleteAccount from '../components/settings/DeleteAccount';
import ManageSubscription from '../components/settings/ManageSubscription';
import PaymentHistory from '../components/settings/PaymentHistory';
import { useAuth } from '../context/AuthContext';
import '../styles/settings.css';

export default function Settings() {
  // دریافت اطلاعات کاربر لاگین شده
  const { user, updateUser } = useAuth();

  // مدیریت State برای تنظیمات عمومی (اعلان‌ها، صدا، زبان) که در localstorage ذخیره می‌شوند
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('spotifySettings');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      soundEnabled: true,
      language: 'en'
    };
  });

  // تابع کمکی برای ذخیره تغییرات تنظیمات در LocalStorage
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('spotifySettings', JSON.stringify(newSettings));

    if (key === 'language') {
      document.documentElement.lang = value;
      document.documentElement.dir = value === 'fa' ? 'rtl' : 'ltr';
    }
    
  };

  // اگر کاربر لاگین نباشد
  if (!user) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="settings-page">
          <p className="settings-empty">Please log in to access settings.</p>
        </main>
      </div>
    );
  }

  // نمایش تاریخچه پرداخت فقط برای کاربران نقره‌ای و طلایی
  const showPaymentHistory = user.subscription === 'silver' || user.subscription === 'gold';

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="settings-page">
        <h1 className="settings-title">Settings</h1>

        {/* ===== 1. تنظیمات عمومی (ادغام شده از GeneralSettings) ===== */}
        <section className="settings-section">
          <h2 className="section-title">General Settings</h2>

          {/* محدودیت اعلان‌ها */}
          <div className="settings-row">
            <label className="toggle-label">
              <span>Enable Notifications</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications}
                  onChange={(e) => updateSetting('notifications', e.target.checked)}
                />
                <span className="slider"></span>
              </div>
            </label>
          </div>

          {/* تغییر صدای سامانه */}
          <div className="settings-row">
            <label className="select-label">
              <span>Sound Effects</span>
              <select 
                value={settings.soundEnabled ? 'enabled' : 'disabled'}
                onChange={(e) => updateSetting('soundEnabled', e.target.value === 'enabled')}
                className="settings-select"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          </div>

          {/* تغییر زبان */}
          <div className="settings-row">
            <label className="select-label">
              <span>Language</span>
              <select 
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="settings-select"
              >
                <option value="en">English</option>
                <option value="fa">فارسی</option>
                <option value="fr">Français</option>
              </select>
            </label>
          </div>
        </section>

        {/* ===== 2. مدیریت اشتراک ===== */}
        <ManageSubscription user={user}  updateUser={updateUser} />
        
        {/* ===== 3. تاریخچه پرداخت ===== */}
        {showPaymentHistory && <PaymentHistory user={user} />}

        {/* ===== 4. تغییر رمز عبور ===== */}
        <ChangePassword />

        {/* ===== 5. حذف حساب کاربری ===== */}
        <DeleteAccount  />
      </main>
    </div>
  );
}