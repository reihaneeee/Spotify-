// src/components/auth/SignupForm.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../utils/auth';
import { validateEmail, validatePassword, validateAge } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { registerListener } from '../../services/authApi';
/**
 * SignupForm Component - for regular users (listeners)
 */
const SignupForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from Context

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: 'prefer-not-to-say'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // If the field is email, automatically trim spaces to avoid validation errors
    const finalValue = name === 'email' ? value.trim() : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
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

    // Display Name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email.trim())) { 
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.valid) {
        newErrors.password = passwordCheck.message;
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Birth Date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else if (!validateAge(formData.birthDate)) {
      newErrors.birthDate = 'You must be at least 13 years old';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
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
      // ارسال داده‌ها با نام فیلدهای مورد انتظار بک‌اند (snake_case)
      await registerListener({
        display_name: formData.displayName,
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.confirmPassword,
        birth_date: formData.birthDate,
        gender: formData.gender,
        accepted_privacy_policy: true // فیلد اجباری بک‌اند
      });

      // ورود خودکار پس از ثبت‌نام موفق
      const loginResult = await login(formData.email.trim(), formData.password);
      if (loginResult.success) {
        navigate('/home');
      } else {
        setErrors({ general: 'ثبت‌نام انجام شد اما ورود خودکار ناموفق بود.' });
      }
    } catch (err) {
      // دریافت پیغام خطای دقیق از سمت Django
      const backendErrors = err?.response?.data;
      if (backendErrors && typeof backendErrors === 'object') {
        const firstKey = Object.keys(backendErrors)[0];
        const errorMsg = Array.isArray(backendErrors[firstKey]) 
          ? backendErrors[firstKey][0] 
          : backendErrors[firstKey];
        setErrors({ general: `${firstKey}: ${errorMsg}` });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {/* General error message */}
      {errors.general && (
        <div className="error-alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10a1 1 0 110 2 1 1 0 010-2zm1-7H7v5h2V4z"/>
          </svg>
          <span>{errors.general}</span>
        </div>
      )}

      {/* Display Name */}
      <div className="form-group">
        <label htmlFor="displayName">Display Name</label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Enter your display name"
          className={`form-input ${errors.displayName ? 'error' : ''}`}
          disabled={isLoading}
          maxLength="50"
        />
        {errors.displayName && <span className="error-text">{errors.displayName}</span>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          className={`form-input ${errors.email ? 'error' : ''}`}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <span className="error-text">{errors.password}</span>}
        <small className="help-text">Must contain at least 8 characters with uppercase, lowercase, and numbers</small>
      </div>

      {/* Confirm Password */}
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex="-1"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>

      {/* Birth Date */}
      <div className="form-group">
        <label htmlFor="birthDate">Date of Birth</label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className={`form-input ${errors.birthDate ? 'error' : ''}`}
          disabled={isLoading}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
        <small className="help-text">You must be at least 13 years old</small>
      </div>

      {/* Gender */}
      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={`form-input ${errors.gender ? 'error' : ''}`}
          disabled={isLoading}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
        {errors.gender && <span className="error-text">{errors.gender}</span>}
      </div>

      {/* Terms and Conditions */}
      <p className="terms-text">
        By clicking on sign-up, you agree to Spotify Clone's{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions of Use</a>.
      </p>
      <p className="terms-text">
        To learn more about how Spotify Clone collects, uses, shares and protects your personal data, please see{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">Spotify Clone's Privacy Policy</a>.
      </p>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn-primary btn-block"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Creating account...
          </>
        ) : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;