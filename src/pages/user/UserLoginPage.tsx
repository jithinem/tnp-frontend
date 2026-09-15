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
    <section className="page-section">
      <div className="login">
        <h1>User Login</h1>
        <form className="login-grid" onSubmit={submit}>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {auth.error && <div className="error">{auth.error}</div>}
          <button className="button button-primary" disabled={auth.loading}>{auth.loading ? <LoaderSpinner size="small" inline /> : 'Login'}</button>
          <button className="button button-secondary" type="button" onClick={() => navigate(routes.forgotPassword)}>
            Forgot password?
          </button>
          <button className="button button-secondary" type="button" onClick={() => navigate(routes.signup)}>
            Create account
          </button>
        </form>
      </div>
    </section>
  );
}
