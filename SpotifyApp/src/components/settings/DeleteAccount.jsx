import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    //  Get the full user with password from the main 'users' array
    const fullUser = users.find((u) => u.username === user.username);

    // Check if user exists and password matches
    if (!fullUser || fullUser.password !== password) {
      setError('Incorrect password.');
      return;
    }

    // Remove user from list and save it
    const filtered = users.filter((u) => u.username !== user.username);
    localStorage.setItem('users', JSON.stringify(filtered));

    // Context logout will clear currentUser and state
    logout();
    navigate('/login');
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
          <p className="confirm-text">Enter your password to confirm:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Your password"
            className="confirm-input"
          />
          {error && <p className="form-error">{error}</p>}

          <div className="confirm-actions">
            <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              Confirm delete
            </button>
          </div>
        </div>
      )}
    </section>
  );
}