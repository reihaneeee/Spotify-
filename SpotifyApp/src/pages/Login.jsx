import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';

/**
 * Login Page Component
 * Provides authentication interface for all user types
 */
const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <svg viewBox="0 0 1134 340" className="spotify-logo">
            <path fill="currentColor" d="M8 171c0 92 76 168 168 168s168-76 168-168S268 4 176 4 8 79 8 171zm230 78c-39-24-89-30-147-17-14 2-16-18-4-20 64-15 118-8 162 19 11 7 0 24-11 18zm17-45c-45-28-114-36-167-20-17 5-23-21-7-25 61-18 136-9 188 23 14 9 0 31-14 22zm19-47c-50-30-138-36-203-20-9 2-13-14-5-16 73-18 170-10 230 24 12 8 0 34-12 26z"/>
          </svg>
          <span className="logo-text">Spotify Clone</span>
        </div>

        <h1 className="auth-title">Log in to Spotify Clone</h1>

        <LoginForm />

        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        <Link to="/signup" className="btn-outline-white">
          Sign up for Spotify Clone
        </Link>
        
        <div className="auth-footer">
            
            <Link to="/forgot-password">Forgot your password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
