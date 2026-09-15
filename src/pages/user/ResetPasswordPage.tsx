import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { routes } from '../../constants/routes';

interface ResetPasswordLocationState {
  email?: string;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetPasswordLocationState) || {};

  const [form, setForm] = useState({
    email: state.email || '',
    otp: '121212',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', form);
      setMessage(response.data?.message || 'Password reset successfully.');
      setTimeout(() => navigate(routes.login), 600);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Unable to reset password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="login">
        <h1>Reset Password</h1>
        <form className="login-grid" onSubmit={submit}>
          <label>
            Email
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>

          <label>
            OTP
            <input type="text" required minLength={6} maxLength={8} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
            <small className="muted">Demo OTP: 121212</small>
          </label>

          <label>
            New Password
            <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <button className="button button-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button className="button button-secondary" type="button" onClick={() => navigate(routes.login)}>
            Cancel
          </button>
        </form>
      </div>
    </section>
  );
}
