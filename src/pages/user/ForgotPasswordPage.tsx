import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { routes } from '../../constants/routes';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data?.message || 'Password reset OTP sent.');
      navigate(routes.resetPassword, { state: { email } });
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Unable to send reset OTP.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="login">
        <h1>Forgot Password</h1>
        <form className="login-grid" onSubmit={submit}>
          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <button className="button button-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>

          <button className="button button-secondary" type="button" onClick={() => navigate(routes.login)}>
            Back to Login
          </button>
        </form>
      </div>
    </section>
  );
}
