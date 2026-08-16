import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiDeleteAccount } from '../../utils/auth';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await apiDeleteAccount();

      if (!result.success) {
        setError(result.message || 'Failed to delete account.');
        return;
      }

      logout();
      navigate('/login');
    } catch (err) {
      setError('An error occurred during account deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="settings-section danger-section">
      <h2 className="section-title">Delete Account</h2>
      <p className="section-description">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      {!showConfirm ? (
        <button
          className="btn-danger"
          onClick={() => setShowConfirm(true)}
        >
          Delete my account
        </button>
      ) : (
        <div className="confirm-delete">
          <p className="confirm-text">Are you sure you want to permanently delete your account?</p>
          {error && <p className="form-error">{error}</p>}

          <div className="confirm-actions">
            <button className="btn-secondary" onClick={() => setShowConfirm(false)} disabled={loading}>
              Cancel
            </button>
            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Confirm delete'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}