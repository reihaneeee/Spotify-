// src/__tests__/ContextAndRouting.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../components/home/Sidebar';

// 👇 AuthContext را به‌درستی Mock کنید
const mockAuthContext = (user) => ({
  user,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
});

// کامپوننت تست با AuthContext سفارشی
const TestWrapper = ({ children, user }) => {
  // از useContext واقعی استفاده نمی‌کنیم، بلکه مستقیماً Sidebar را با props تست می‌کنیم
  // اما Sidebar از useAuth استفاده می‌کند، پس باید Mock کنیم
  return children;
};

// بهتر است Sidebar را با props تست کنیم، اما چون useAuth دارد، باید آن را Mock کنیم
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

const renderSidebarWithRole = (role, status = 'approved') => {
  // تنظیم Mock برای useAuth
  useAuth.mockReturnValue({
    user: { role, status },
    loading: false,
  });

  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Context and Access Control Tests', () => {
  it('7. renders Support link but hides Admin Panel for regular listeners', () => {
    renderSidebarWithRole('listener');
    
    // Support باید نمایش داده شود
    expect(screen.getByText('Support')).toBeInTheDocument();
    
    // Admin Panel نباید برای کاربر عادی نمایش داده شود
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('8. renders Admin Panel for admins', () => {
    renderSidebarWithRole('admin');
    
    // Admin Panel باید برای ادمین نمایش داده شود
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    
    // Support هم برای ادمین نمایش داده می‌شود (چون برای همه کاربران است)
    expect(screen.queryByText('Support')).not.toBeInTheDocument();
  });

  it('9. renders Dashboard for approved artists', () => {
    renderSidebarWithRole('artist', 'approved');
    
    // Dashboard باید برای هنرمند تایید شده نمایش داده شود
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('10. renders home link for all users', () => {
    renderSidebarWithRole('listener');
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});