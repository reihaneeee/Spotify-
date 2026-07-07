// src/pages/TermsPrivacy.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export default function TermsPrivacy() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isPrivacy = location.pathname.includes('privacy') || location.pathname.includes('privacy');

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#181818', padding: '40px', borderRadius: '12px', border: '1px solid #282828' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: '600' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {isPrivacy ? (
          <>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
              <Shield size={36} color="#1db954" /> Privacy Policy
            </h1>
            <p style={{ color: '#b3b3b3', lineHeight: '1.6', marginBottom: '16px' }}>
              At Spotify Clone, we take your privacy seriously. This Policy explains how we collect, use, and protect your personal data when you stream music or create an artist account.
            </p>
            <h2 style={{ fontSize: '20px', margin: '24px 0 12px' }}>1. Data We Collect</h2>
            <p style={{ color: '#b3b3b3', lineHeight: '1.6' }}>
              We store your username, email address, date of birth, and music preferences (such as playlists and followed artists) safely in your local environment.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
              <FileText size={36} color="#1db954" /> Terms and Conditions of Use
            </h1>
            <p style={{ color: '#b3b3b3', lineHeight: '1.6', marginBottom: '16px' }}>
              Welcome to Spotify Clone. By signing up or streaming music on our system, you agree to comply with the following rules and regulations.
            </p>
            <h2 style={{ fontSize: '20px', margin: '24px 0 12px' }}>1. Streaming Limits</h2>
            <p style={{ color: '#b3b3b3', lineHeight: '1.6' }}>
              Basic accounts are strictly limited to 60 streams per day and a maximum of 6 playlists. Upgrading to Silver or Gold accounts removes these limitations.
            </p>
          </>
        )}
      </div>
    </div>
  );
}