import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../constants/routes';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function UserLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user?.role;
      if (role === 'admin') {
        navigate(routes.adminDashboard);
      } else {
        navigate(routes.dashboard);
      }
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-intro">
          <span className="auth-kicker">JOBPORTAL</span>
          <h1>Build the career you want.</h1>
          <p>Find roles that match your ambitions, connect with leading teams, and take your next step with confidence.</p>
          <div className="auth-proof">
            <div className="auth-proof-item"><strong>01</strong><span>Discover relevant opportunities</span></div>
            <div className="auth-proof-item"><strong>02</strong><span>Apply with a profile that stands out</span></div>
            <div className="auth-proof-item"><strong>03</strong><span>Move forward with clarity</span></div>
          </div>
        </div>
        <div className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-eyebrow">Welcome back</span>
            <h2>Sign in to your account</h2>
            <p>Continue your job search where you left off.</p>
          </div>
          <form className="login-grid" onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {auth.error && <div className="error">{auth.error}</div>}
          <button className="button button-primary" disabled={auth.loading}>{auth.loading ? <LoaderSpinner size="small" inline /> : 'Login'}</button>
          <button className="auth-link-button" type="button" onClick={() => navigate(routes.forgotPassword)}>
            Forgot password?
          </button>
          <div className="auth-divider"><span>New to JobPortal?</span></div>
          <button className="button button-secondary" type="button" onClick={() => navigate(routes.signup)}>Create an account</button>
        </form>
        </div>
      </div>
    </section>
  );
}
