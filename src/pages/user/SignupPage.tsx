import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { routes } from '../../constants/routes';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'signup' | 'verify'>('signup');

  async function signup(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', form);
      setMessage(response.data?.message || 'Signup successful. OTP sent.');
      setStage('verify');
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup/verify-otp', {
        email: form.email,
        otp,
      });

      setMessage(response.data?.message || 'OTP verified successfully.');
      setTimeout(() => navigate(routes.login), 600);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'OTP verification failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="login">
        <h1>{stage === 'signup' ? 'Create Account' : 'Verify OTP'}</h1>

        {stage === 'signup' ? (
          <form className="login-grid" onSubmit={signup}>
            <label>First Name<input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
            <label>Last Name<input type="text" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
            <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Phone Number<input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+1 234 567 8900" /></label>
            <label>Password<input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="button button-primary" disabled={loading}>{loading ? <LoaderSpinner size="small" inline /> : 'Signup'}</button>
            <button className="button button-secondary" type="button" onClick={() => navigate(routes.login)}>Back to Login</button>
          </form>
        ) : (
          <form className="login-grid" onSubmit={verifyOtp}>
            <label>Email<input type="email" required value={form.email} readOnly /></label>
            <label>OTP<input type="text" required minLength={6} maxLength={8} value={otp} onChange={(e) => setOtp(e.target.value)} /></label>
            <div className="info-box">Your OTP is: <strong>121212</strong></div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="button button-primary" disabled={loading}>{loading ? <LoaderSpinner size="small" inline /> : 'Verify OTP'}</button>
            <button className="button button-secondary" type="button" onClick={() => setStage('signup')}>Back to Signup</button>
          </form>
        )}
      </div>
    </section>
  );
}
