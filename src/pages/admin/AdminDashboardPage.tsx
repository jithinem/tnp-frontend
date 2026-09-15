import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminDashboard } from '../../features/jobs/dashboardSlice';
import { fetchJobs, deleteJob } from '../../features/jobs/jobsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Job } from '../../types';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../constants/routes';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function AdminDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const dashboard = useSelector((state: RootState) => state.dashboard.summary);
  const jobs = useSelector((state: RootState) => state.jobs.list);
  const loading = useSelector((state: RootState) => state.jobs.loading);
  const deleting = useSelector((state: RootState) => state.jobs.deleting);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchJobs({ page: 1, limit: 10 }));
  }, [dispatch]);

  function remove(id: number) {
    if (window.confirm('Delete this job?')) {
      dispatch(deleteJob(id));
    }
  }

  const totals = dashboard?.totals ?? {};
  const byStatus = dashboard?.applicationsByStatus ?? {};

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Admin Dashboard</div>
        <div className="grid">
          <article className="card clickable-card" onClick={() => navigate(routes.adminUsers)}><div className="muted">Total Users</div><div className="job-title">{totals.users ?? 0}</div></article>
          <article className="card clickable-card" onClick={() => navigate(routes.adminUsers)}><div className="muted">Applicants</div><div className="job-title">{totals.applicants ?? 0}</div></article>
          <article className="card clickable-card" onClick={() => navigate(routes.adminJobs)}><div className="muted">Jobs</div><div className="job-title">{totals.jobs ?? jobs.length}</div></article>
          <article className="card clickable-card" onClick={() => navigate(routes.adminJobs)}><div className="muted">Active Jobs</div><div className="job-title">{totals.activeJobs ?? 0}</div></article>
          <article className="card clickable-card" onClick={() => navigate(routes.adminApplications)}><div className="muted">Applications</div><div className="job-title">{totals.applications ?? 0}</div></article>
        </div>

        <div className="grid">
          {(Object.entries(byStatus) as Array<[string, number]>).map(([status, count]) => (
            <article key={status} className="card clickable-card" onClick={() => navigate(`${routes.adminApplications}?status=${encodeURIComponent(status)}`)}>
              <div className="muted">{status}</div>
              <div className="job-title">{count}</div>
            </article>
          ))}
        </div>

        <div className="form">
          <div className="section-title">Jobs</div>
          {loading ? <LoaderSpinner text="Loading jobs..." /> : (
            <table className="table">
              <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {jobs.map((job: Job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.company_name}</td>
                    <td>{job.location}</td>
                    <td><span className="badge success">{job.is_active ? 'Active' : 'Inactive'}</span></td>
                    {/* <td><button className="button button-danger small" disabled={deleting} onClick={() => remove(job.id)}>Delete</button></td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
