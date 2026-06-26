// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateEmail } from '../utils/validation';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors = {};
    const trimmedEmail = email.trim(); // Remove accidental spaces

    // 1. Check if the email format is correct
    const isValidEmail = validateEmail(trimmedEmail);
    if (!isValidEmail) {
      newErrors.email = 'Invalid email format. Please enter a valid email address.';
    }

    // 2. Check if this email exists in the main 'users' array inside localStorage
    if (!newErrors.email) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find(user => user.email === trimmedEmail);
      
      if (!userExists) {
        newErrors.email = 'This email is not registered. Please check your email or sign up first.';
      }
    }

    // 3. If there are errors, show them and stop.
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    // Phase 1 behavior: Print the code to the browser console.
    console.log(`%c 🔑 Recovery Code for ${trimmedEmail}: ${code}`, 'background: #222; color: #bada55; font-size: 1.2rem;');
    
    setErrors({});
    setIsLoading(false);
    setStep('code');
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (verificationCode !== generatedCode) {
      newErrors.code = 'Incorrect code. Please check the Console (F12) and copy it exactly.';
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep('newPassword');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update the password in the 'users' array in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.email === email.trim()) {
        return { ...user, password: newPassword };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setErrors({});
    setStep('success');
  };

  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    console.log(`%c 🔑 New Recovery Code: ${code}`, 'background: #222; color: #bada55; font-size: 1.2rem;');
    setVerificationCode('');
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Password Recovery</h1>
            <p>
              {step === 'email' && 'Enter your email address'}
              {step === 'code' && 'Enter the 6-digit verification code'}
              {step === 'newPassword' && 'Set your new password'}
              {step === 'success' && 'Password changed successfully'}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Recovery Code'}
              </button>

              <div className="auth-footer">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="code">6-Digit Verification Code</label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={errors.code ? 'error' : ''}
                  placeholder="123456"
                  maxLength="6"
                />
                {errors.code && <span className="error-message">{errors.code}</span>}
                <p className="helper-text">
                  <strong>⚠️ Phase 1 Notice:</strong> Open the browser console (<code>F12</code> → <b>Console</b> tab). The 6-digit code is printed there.
                </p>
              </div>

              <button type="submit" className="btn-primary btn-block">
                Verify Code
              </button>

              <div className="auth-footer">
                <button type="button" onClick={handleResendCode} className="link-button">
                  Resend Code
                </button>
                <button type="button" onClick={() => setStep('email')} className="link-button">
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'newPassword' && (
            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? 'error' : ''}
                  placeholder="At least 8 characters"
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn-primary btn-block">
                Change Password
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>Your password has been changed successfully.</p>
              <Link to="/login" className="btn-primary btn-block">
                Login to Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;