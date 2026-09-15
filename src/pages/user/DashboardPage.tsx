import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicantDashboard } from '../../features/jobs/dashboardSlice';
import { fetchApplications } from '../../features/applications/applicationsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const applications = useSelector((state: RootState) => state.applications.list);
  const dashboard = useSelector((state: RootState) => state.dashboard.summary);
  const loading = useSelector((state: RootState) => state.applications.loading);

  useEffect(() => {
    dispatch(fetchApplicantDashboard());
    dispatch(fetchApplications({ page: 1, limit: 5 }));
  }, [dispatch]);

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Applicant Dashboard</div>
        <div className="grid">
          <Link className="card clickable-card" to="/applications"><div className="muted">Applications</div><div className="job-title">{dashboard?.applicationsCount ?? applications.length}</div></Link>
          <Link className="card clickable-card" to="/applications"><div className="muted">Shortlisted</div><div className="job-title">{dashboard?.statusSummary?.SHORTLISTED ?? 0}</div></Link>
          <Link className="card clickable-card" to="/applications"><div className="muted">Pending</div><div className="job-title">{dashboard?.statusSummary?.PENDING ?? 0}</div></Link>
        </div>
        <div className="form">
          <div className="section-title">Recent Applications</div>
          {loading ? <LoaderSpinner text="Loading applications..." /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Job</th><th>Status</th><th>Applied Date</th><th>Action</th></tr></thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}><td>{app.id}</td><td>{app.job?.title || app.job_id}</td><td><span className="badge warning">{app.status}</span></td><td>{app.applied_at || app.created_at || '—'}</td><td><Link className="button small" to={`/applications/${app.id}`}>Details</Link></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
