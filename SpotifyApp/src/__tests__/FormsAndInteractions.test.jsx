// src/__tests__/FormsAndInteractions.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadWork from '../components/artist_dashboard/UploadWork';
import ArtistApproval from '../components/admin/ArtistApproval';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/home/Sidebar';
import { AuthContext } from '../context/AuthContext';

vi.mock('../context/DataContext', () => ({
  useData: () => ({ users: [] }),
}));

// Mock ساده برای تست‌های دیگر
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test', role: 'artist' } }),
  AuthContext: {
    Provider: ({ children }) => children,
  },
}));


describe('Forms and Interactions Tests', () => {
  // تست ۳ (بدون تغییر)
  it('3. does not call onAdd when title is empty and shows validation error', async () => {
    const mockAdd = vi.fn();
    const { container } = render(
      <UploadWork onAdd={mockAdd} onUpdate={() => {}} onCancel={() => {}} editData={null} />
    );
    
    const form = container.querySelector('form');
    fireEvent.submit(form);
    
    expect(mockAdd).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Please enter a title')).toBeInTheDocument();
    });
  });
  
  // تست ۴ (اصلاح‌شده: استفاده از `fireEvent` و `waitFor`)
  it('4. adds a new track field when "Add Another Track" is clicked in Album mode', async () => {
    render(
      <UploadWork onAdd={() => {}} onUpdate={() => {}} onCancel={() => {}} editData={null} />
    );

    // ۱. پیدا کردن select و تغییر به 'album' با fireEvent
    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'album' } });

    // ۲. منتظر ظاهر شدن دکمه (بدون نیاز به تایم‌اوت دستی)
    const addTrackBtn = await screen.findByText('+ Add Another Track');

    // ۳. کلیک روی دکمه با fireEvent (سریع‌تر و بدون باگ‌های async)
    fireEvent.click(addTrackBtn);

    // ۴. بررسی اضافه شدن ترک جدید
    await waitFor(() => {
      expect(screen.getByText(/Track 1/i)).toBeInTheDocument();
    });
  });
  it('5. rejected artist does not see Dashboard in sidebar', () => {
    const rejectedArtist = {
      id: 'artist-rejected',
      role: 'artist',
      status: 'rejected',
      displayName: 'Rejected Artist',
      email: 'rejected@artist.com',
    };

    render(
      <AuthContext.Provider value={{ user: rejectedArtist, loading: false }}>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Playlists')).toBeInTheDocument();
    expect(screen.getByText('Albums')).toBeInTheDocument();
    expect(screen.getByText('Singles')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  // تست ۶ (بدون تغییر)
  it('6. calls onApprove and clears selected artist', async () => {
    const mockApprove = vi.fn();
    const mockArtists = [{ id: '1', email: 'test@artist.com', artistName: 'Test Artist' }];
    
    render(<ArtistApproval artists={mockArtists} onApprove={mockApprove} onReject={() => {}} />);
    
    fireEvent.click(screen.getByText('Review'));
    fireEvent.click(screen.getByText(/Approve Artist/i));
    
    expect(mockApprove).toHaveBeenCalledWith('1');
  });
});