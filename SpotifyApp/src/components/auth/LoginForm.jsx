import { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';

/**
 * LoginForm Component
 * Handles user authentication for all user types
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Store auth data
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.user));
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        navigate('/home');

        // For phase2-or other tasks in phase 1 
        // because currently we dont have admin and support pages
        // Redirect based on user type
        /*if (result.user.userType === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.userType === 'support') {
          navigate('/support/dashboard');
        } else {
          navigate('/home');
        }*/
      } else {
        setErrors({ general: result.message });
      }
      } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };
        
      

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {errors.general && (
        <div className="error-alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10a1 1 0 110 2 1 1 0 010-2zm1-7H7v5h2V4z"/>
          </svg>
          <span>{errors.general}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email or username</label>
        <input
          type="text"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email or username"
          className={`form-input ${errors.email ? 'error' : ''}`}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex="-1"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <span>Remember me</span>
        </label>
      </div>

      <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Logging in...
          </>
        ) : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;
