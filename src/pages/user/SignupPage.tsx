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
    <section className="auth-page">
      <div className="auth-shell auth-shell-signup">
        <div className="auth-intro">
          <span className="auth-kicker">JOBPORTAL</span>
          <h1>Your next opportunity starts here.</h1>
          <p>Create a profile that helps the right employers find you and keeps every application in one place.</p>
          <div className="auth-highlight"><span className="auth-highlight-mark">+</span><div><strong>One profile, more possibilities</strong><span>Showcase your experience once and apply faster.</span></div></div>
          <div className="auth-highlight"><span className="auth-highlight-mark">+</span><div><strong>Built for your next move</strong><span>Search roles by what matters to you.</span></div></div>
        </div>
        <div className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-eyebrow">{stage === 'signup' ? 'Get started' : 'Almost there'}</span>
            <h2>{stage === 'signup' ? 'Create your account' : 'Verify your email'}</h2>
            <p>{stage === 'signup' ? 'It takes less than two minutes to get started.' : 'Enter the verification code sent to your email.'}</p>
          </div>

        {stage === 'signup' ? (
          <form className="login-grid" onSubmit={signup}>
            <div className="auth-field-row"><label>First Name<input type="text" autoComplete="given-name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
            <label>Last Name<input type="text" autoComplete="family-name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label></div>
            <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Phone Number<input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+1 234 567 8900" /></label>
            <label>Password<input type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="button button-primary" disabled={loading}>{loading ? <LoaderSpinner size="small" inline /> : 'Signup'}</button>
            <button className="button button-secondary" type="button" onClick={() => navigate(routes.login)}>Already have an account? Sign in</button>
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
      </div>
    </section>
  );
}
