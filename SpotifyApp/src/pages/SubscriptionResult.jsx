// src/pages/SubscriptionResult.jsx
import { useSearchParams, Link } from 'react-router-dom';

export default function SubscriptionResult() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const refId = searchParams.get('ref_id');
  const message = searchParams.get('message');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: '#fff' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center', padding: '40px', background: '#181818', borderRadius: '12px' }}>
        {status === 'success' ? (
          <>
            <h1 style={{ color: '#1db954' }}>🎉 Payment Successful!</h1>
            <p>Your subscription has been activated.</p>
            <p style={{ fontSize: '12px', color: '#b3b3b3' }}>Ref ID: {refId}</p>
          </>
        ) : (
          <>
            <h1 style={{ color: '#e91429' }}>❌ Payment Failed</h1>
            <p>{message || 'Something went wrong. Please try again.'}</p>
          </>
        )}
        <Link to="/home" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: '#1db954', color: '#000', textDecoration: 'none', borderRadius: '24px', fontWeight: 'bold' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}