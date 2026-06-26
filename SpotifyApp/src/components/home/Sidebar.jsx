import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '→' : '←'}
      </button>

      <nav className="sidebar-nav">
        <NavLink 
          to="/home" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">🏠</span>
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/playlists" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">🎵</span>
          <span>Playlists</span>
        </NavLink>
        
        <NavLink 
          to="/albums" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">💿</span>
          <span>Albums</span>
        </NavLink>
        
        <NavLink 
          to="/singles" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">🎧</span>
          <span>Singles</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">👤</span>
          <span>Profile</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">⚙️</span>
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
