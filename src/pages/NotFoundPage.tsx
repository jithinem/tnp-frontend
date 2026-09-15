import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="login">
          <div className="section-title">404 - Page Not Found</div>
          <p className="muted">The page or resource you requested could not be found.</p>
          <div className="modal-actions">
            <Link className="button button-primary" to="/">Go Home</Link>
            <Link className="button button-secondary" to="/jobs">Browse Jobs</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
