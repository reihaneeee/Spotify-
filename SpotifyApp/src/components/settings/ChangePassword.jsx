import { useState } from 'react';
import { validatePassword } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

export default function ChangePassword() {
  const { user, updateUser } = useAuth(); // Get user and updateUser from context
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

   const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  }; 
  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const fullUser = users.find((u) => u.username === user.username);
    
    if (!fullUser) {
      setError('User not found.');
      return;
    }

    if (fullUser.password !== form.currentPassword) {
      setError('Current password is incorrect.');
      return;
    }

    const passwordError = validatePassword(form.newPassword);
    if (!passwordError.valid) {
      setError(passwordError.message);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    updateUser({ password: form.newPassword });
    setSuccess('Password changed successfully.');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <section className="settings-section">
      <h2 className="section-title">Change Password</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className="btn-primary">
          Update password
        </button>
      </form>
    </section>
  );
}
