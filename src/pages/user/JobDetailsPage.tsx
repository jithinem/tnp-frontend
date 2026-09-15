import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchJobById } from '../../features/jobs/jobsSlice';
import { fetchApplications } from '../../features/applications/applicationsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function JobDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const job = useSelector((state: RootState) => state.jobs.current);
  const loading = useSelector((state: RootState) => state.jobs.loadJobLoading);
  const user = useSelector((state: RootState) => state.auth.user);
  const applications = useSelector((state: RootState) => state.applications.list);

  useEffect(() => {
    if (id) dispatch(fetchJobById(Number(id)));
  }, [dispatch, id]);
  useEffect(() => { if (user?.role === 'applicant') dispatch(fetchApplications({ page: 1, limit: 100 })); }, [dispatch, user?.role]);

  if (loading) return <div className="app-shell-inner page-section"><LoaderSpinner text="Loading job details..." /></div>;
  if (!job) return <div className="app-shell-inner page-section">No job found.</div>;

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <article className="card">
          <span className="badge">{job.employment_type}</span>
          <div className="section-title">{job.title}</div>
          <div className="job-meta">{job.company_name} • {job.location} • {job.experience_level}</div>
          <div className="form-row">
            <div>
              <h3>Description</h3>
              <p>{job.description}</p>
              <h3>Requirements</h3>
              <p>{job.requirements}</p>
              <div className="job-meta">Salary {job.salary_min} - {job.salary_max}</div>
              <div className="job-meta">Category: {job.category?.name || '—'}</div>
            </div>
            {user?.role !== 'admin' && (
              <div className="form">
                <div className="section-title">Quick Apply</div>
                {applications.some((application) => application.job_id === job.id)
                  ? <span className="badge success">Applied</span>
                  : <Link className="button button-primary" to={`/apply/${job.id}`}>Apply for this Job</Link>}
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
