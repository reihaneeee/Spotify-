import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Disc3, Headphones, User, Settings, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'; // ایمپورت آیکون‌های وکتور
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth(); // برای بررسی دسترسی ادمین

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="sidebar-nav">
        <NavLink 
          to="/home" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Home className="icon" size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/playlists" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ListMusic className="icon" size={24} />
          <span>Playlists</span>
        </NavLink>
        
        <NavLink 
          to="/albums" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Disc3 className="icon" size={24} />
          <span>Albums</span>
        </NavLink>
        
        <NavLink 
          to="/singles" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Headphones className="icon" size={24} />
          <span>Singles</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User className="icon" size={24} />
          <span>Profile</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings className="icon" size={24} />
          <span>Settings</span>
        </NavLink>

        {/* لینک پنل ادمین که فقط برای ادمین نشان داده می‌شود */}
        {user && user.userType === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ marginTop: 'auto', color: '#1db954' }}
          >
            <ShieldCheck className="icon" size={24} color="currentColor" />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}