import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../store/store';
import { useState } from 'react';
import { ConfirmationModal } from '../components/ConfirmationModal';

export function AppLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'admin';
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isLoginPage = location.pathname === '/login' || location.pathname === '/admin/login';

  async function handleLogout() {
    setLogoutOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="app-header">
        <div className="app-shell">
          <Link className="brand" to="/">JobPortal</Link>
          <nav className="nav-links">
            {isAuthenticated && !isAdmin && <Link to="/jobs">Jobs</Link>}
            {!isAuthenticated && <Link className="button button-primary small" to="/login">Login</Link>}
            {isAuthenticated && !isAdmin && <><Link to="/dashboard">Dashboard</Link><Link to="/applications">Applications</Link><Link to="/profile">Profile</Link></>}
            {isAuthenticated && isAdmin && <><Link to="/admin/jobs">Jobs</Link><Link to="/admin">Dashboard</Link><Link to="/admin/categories">Categories</Link><Link to="/admin/applications">Applications</Link><Link to="/admin/users">Users</Link><Link to="/admin/profile">Profile</Link></>}
            {isAuthenticated && <button className="button button-secondary small" onClick={() => setLogoutOpen(true)}>Logout</button>}
          </nav>
        </div>
      </header>
      <main>
        {!isLoginPage && <div className="app-shell-inner global-back"><button className="button button-secondary small" onClick={() => navigate(-1)}>← Back</button></div>}
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="app-shell footer-grid">
          <div>
            <div className="brand">JobPortal</div>
            <p className="muted">Your next opportunity starts here.</p>
          </div>
          <div>
            <div className="footer-title">Platform</div>
            <div className="footer-links">
              {isAuthenticated && <Link to="/jobs">Browse Jobs</Link>}
              {isAuthenticated && !isAdmin && <Link to="/dashboard">Applicants</Link>}
            </div>
          </div>
          <div>
            <div className="footer-title">Company</div>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      <ConfirmationModal open={logoutOpen} title="Log out?" message="Are you sure you want to log out of JobPortal?" confirmText="Log out" onConfirm={handleLogout} onCancel={() => setLogoutOpen(false)} />
    </div>
  );
}
