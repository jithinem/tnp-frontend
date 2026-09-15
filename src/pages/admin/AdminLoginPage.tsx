import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

export function AdminLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(loginAdmin(form));
    if (loginAdmin.fulfilled.match(result)) {
      navigate('/admin');
    }
  }

  return (
    <section className="page-section">
      <div className="login">
        <h1>Admin Login</h1>
        <form className="login-grid" onSubmit={submit}>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {auth.error && <div className="error">{auth.error}</div>}
          <button className="button button-primary" disabled={auth.loading}>{auth.loading ? 'Signing in...' : 'Admin Login'}</button>
        </form>
      </div>
    </section>
  );
}
