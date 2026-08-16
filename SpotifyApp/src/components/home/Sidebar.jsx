// src/components/home/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Disc3, Headphones, User, Settings, ChevronLeft, ChevronRight, ShieldCheck, LayoutDashboard, LifeBuoy } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth() || {}; 

  // چک کردن ایمن نقش کاربر (پشتیبانی از هر دو کلید role و userType)
  const isArtist = user?.role === 'artist' || user?.userType === 'artist';
  const isAdminOrSupport = user?.role === 'admin' || user?.userType === 'admin' || user?.role === 'support' || user?.userType === 'support';
  const isApprovedArtist = isArtist && (user?.artist_status === 'approved' || user?.status === 'approved');
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="sidebar-nav">
        <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home className="icon" size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/playlists" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ListMusic className="icon" size={24} />
          <span>Playlists</span>
        </NavLink>
        
        <NavLink to="/albums" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Disc3 className="icon" size={24} />
          <span>Albums</span>
        </NavLink>
        
        <NavLink to="/singles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Headphones className="icon" size={24} />
          <span>Singles</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User className="icon" size={24} />
          <span>Profile</span>
        </NavLink>

        {/* لینک پشتیبانی برای همه کاربران بجز ادمین‌ها */}
        {!isAdminOrSupport && (
          <NavLink to="/support" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LifeBuoy className="icon" size={24} />
            <span>Support</span>
          </NavLink>
        )}
        
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings className="icon" size={24} />
          <span>Settings</span>
        </NavLink>

        {/* داشبورد اختصاصی هنرمند */}
        {isApprovedArtist && (
          <NavLink 
            to="/artist-dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard className="icon" size={24} />
            <span>Dashboard</span>
          </NavLink>
        )}

        {/* پنل مدیریت برای ادمین و پشتیبان */}
        {isAdminOrSupport && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck className="icon" size={24} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}