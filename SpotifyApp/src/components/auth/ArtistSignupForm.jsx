// src/components/auth/ArtistSignupForm.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerArtist } from '../../utils/auth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { Eye, EyeOff } from 'lucide-react';

/**
 * ArtistSignupForm Component
 * Registration form specifically for artists
 */
const ArtistSignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    portfolioLinks: ['']
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle portfolio link changes
   */
  const handlePortfolioChange = (index, value) => {
    const newLinks = [...formData.portfolioLinks];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, portfolioLinks: newLinks }));
  };

  /**
   * Add new portfolio link field
   */
  const addPortfolioLink = () => {
    if (formData.portfolioLinks.length < 5) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, '']
      }));
    }
  };

  /**
   * Remove portfolio link field
   */
  const removePortfolioLink = (index) => {
    if (formData.portfolioLinks.length > 1) {
      const newLinks = formData.portfolioLinks.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, portfolioLinks: newLinks }));
    }
  };

  /**
   * Validate URL format
   */
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    // Artist Name validation
    if (!formData.artistName.trim()) {
      newErrors.artistName = 'Artist name is required';
    } else if (formData.artistName.length < 2) {
      newErrors.artistName = 'Artist name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
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

    // Portfolio links validation
    const validLinks = formData.portfolioLinks.filter(link => link.trim() !== '');
    if (validLinks.length === 0) {
      newErrors.portfolioLinks = 'At least one portfolio link is required';
    } else {
      const invalidLinks = validLinks.filter(link => !isValidUrl(link));
      if (invalidLinks.length > 0) {
        newErrors.portfolioLinks = 'All portfolio links must be valid URLs';
      }
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
      const result = await registerArtist({
        artistName: formData.artistName,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        portfolioLinks: formData.portfolioLinks.filter(link => link.trim() !== '')
      });

      if (result.success) {
        setSubmitSuccess(true);
        // Artists need approval, don't auto-login
      } else {
        setErrors({ general: result.message });
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after submission
  if (submitSuccess) {
    return (
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>Application Submitted!</h2>
        <p>
          Thank you for applying to become an artist on Spotify Clone. 
          Our support team will review your application and portfolio.
        </p>
        <p>
          You will receive an email notification once your application has been reviewed.
          This typically takes 2-3 business days.
        </p>
        <button 
          className="btn-primary"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

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

      {/* Artist Name */}
      <div className="form-group">
        <label htmlFor="artistName">Artist Name *</label>
        <input
          type="text"
          id="artistName"
          name="artistName"
          value={formData.artistName}
          onChange={handleChange}
          placeholder="Your stage name or band name"
          className={`form-input ${errors.artistName ? 'error' : ''}`}
          disabled={isLoading}
          maxLength="100"
        />
        {errors.artistName && <span className="error-text">{errors.artistName}</span>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={`form-input ${errors.email ? 'error' : ''}`}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a secure password"
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
      </div>

      {/* Confirm Password */}
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password *</label>
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
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>

      {/* Bio */}
      <div className="form-group">
        <label htmlFor="bio">Bio (Optional)</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about your music and background..."
          className="form-input"
          disabled={isLoading}
          rows="4"
          maxLength="500"
        />
        <small className="help-text">{formData.bio.length}/500 characters</small>
      </div>

      {/* Portfolio Links */}
      <div className="form-group">
        <label>Portfolio Links * (Soundcloud, YouTube, etc.)</label>
        {formData.portfolioLinks.map((link, index) => (
          <div key={index} className="portfolio-link-row">
            <input
              type="url"
              value={link}
              onChange={(e) => handlePortfolioChange(index, e.target.value)}
              placeholder="https://soundcloud.com/yourmusic"
              className={`form-input ${errors.portfolioLinks ? 'error' : ''}`}
              disabled={isLoading}
            />
            {formData.portfolioLinks.length > 1 && (
              <button
                type="button"
                className="btn-icon btn-remove"
                onClick={() => removePortfolioLink(index)}
                disabled={isLoading}
                aria-label="Remove link"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {errors.portfolioLinks && <span className="error-text">{errors.portfolioLinks}</span>}
        {formData.portfolioLinks.length < 5 && (
          <button
            type="button"
            className="btn-text"
            onClick={addPortfolioLink}
            disabled={isLoading}
          >
            + Add another link
          </button>
        )}
        <small className="help-text">
          Share links to your music on platforms like SoundCloud, YouTube, Spotify, etc.
        </small>
      </div>

      {/* Terms */}
      <p className="terms-text">
        By submitting this application, you agree to Spotify Clone's{' '}
        <a href="/artist-terms" target="_blank" rel="noopener noreferrer">Artist Terms</a>{' '}
        and confirm that you have the rights to the content you upload.
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
            Submitting...
          </>
        ) : 'Submit Application'}
      </button>
    </form>
  );
};

export default ArtistSignupForm;
