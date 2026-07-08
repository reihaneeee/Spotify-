// src/components/admin/SupportAndApproval.jsx
import { useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import TicketsSection from './TicketsSection';
import ArtistApproval from './ArtistApproval';

const SupportAndApproval = ({ tickets, pendingArtists, onReply, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'approval'

  return (
    <div>
      {/* تب‌ها */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #2a2a2a', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'tickets' ? '#1db954' : '#b3b3b3',
            fontWeight: activeTab === 'tickets' ? '700' : '500',
            borderBottom: activeTab === 'tickets' ? '2px solid #1db954' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
        >
          Tickets ({tickets.filter(t => t.status === 'open').length})
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'approval' ? '#1db954' : '#b3b3b3',
            fontWeight: activeTab === 'approval' ? '700' : '500',
            borderBottom: activeTab === 'approval' ? '2px solid #1db954' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
        >
          Artist Approval ({pendingArtists.length})
        </button>
      </div>

      {/* محتوای تب‌ها */}
      <div>
        {activeTab === 'tickets' && (
          <TicketsSection tickets={tickets} onReply={onReply} />
        )}
        {activeTab === 'approval' && (
          <ArtistApproval artists={pendingArtists} onApprove={onApprove} onReject={onReject} />
        )}
      </div>
    </div>
  );
};

export default SupportAndApproval;