// src/components/DefaultCover.jsx
export default function DefaultCover({ className = '', size = 'auto' }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
      <svg width={size === 'large' ? 80 : size === 'small' ? 24 : 40} height={size === 'large' ? 80 : size === 'small' ? 24 : 40} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#ffffff" fillOpacity="0.6"/>
      </svg>
    </div>
  );
}