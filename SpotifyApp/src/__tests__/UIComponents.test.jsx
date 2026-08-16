import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DefaultCover from '../components/artist_dashboard/DefaultCover';
import MyWorksList from '../components/artist_dashboard/MyWorksList';

describe('UI and Rendering Tests', () => {
  // تست ۱: رندر شدن درست کاور پیش‌فرض
  it('1. renders the DefaultCover SVG correctly', () => {
    const { container } = render(<DefaultCover size="large" />);
    // بررسی وجود تگ svg در دام
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    // بررسی اعمال سایز بزرگ
    expect(svgElement).toHaveAttribute('width', '80');
  });

  // تست ۲: نمایش حالت خالی در لیست کارها
  it('2. displays empty state when works array is empty in MyWorksList', () => {
    render(<MyWorksList works={[]} onDelete={() => {}} onEdit={() => {}} onNavigateToUpload={() => {}} />);
    expect(screen.getByText('No works published yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload New Work/i })).toBeInTheDocument();
  });
});