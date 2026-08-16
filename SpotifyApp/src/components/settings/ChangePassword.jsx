import { useState } from 'react';
import { validatePassword } from '../../utils/validation';
import { apiChangePassword } from '../../utils/auth';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(form.newPassword);
    if (!passwordError.valid) {
      setError(passwordError.message);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const result = await apiChangePassword(form.currentPassword, form.newPassword);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('An error occurred while changing password.');
    } finally {
      setLoading(false);
    }
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

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </section>
  );
}