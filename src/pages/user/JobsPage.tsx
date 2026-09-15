import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../features/jobs/categoriesSlice';
import { fetchJobs } from '../../features/jobs/jobsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { fetchApplications } from '../../features/applications/applicationsSlice';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function JobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector((state: RootState) => state.jobs.list);
  const categories = useSelector((state: RootState) => state.categories.list);
  const loading = useSelector((state: RootState) => state.jobs.loading);
  const pages = useSelector((state: RootState) => state.jobs.pagination?.pages ?? 1);
  const page = useSelector((state: RootState) => state.jobs.pagination?.page ?? 1);
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [activePage, setActivePage] = useState(1);
  const user = useSelector((state: RootState) => state.auth.user);
  const applications = useSelector((state: RootState) => state.applications.list);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => { if (user?.role === 'applicant') dispatch(fetchApplications({ page: 1, limit: 100 })); }, [dispatch, user?.role]);

  useEffect(() => {
    const applicationStatusParam = applicationFilter === 'all' ? undefined : applicationFilter;
    dispatch(fetchJobs({
      page: activePage,
      limit: 10,
      category_id: categoryId ? Number(categoryId) : undefined,
      employment_type: type || undefined,
      search: search || undefined,
      application_status: applicationStatusParam,
      user_id: user?.id,
    }));
  }, [dispatch, activePage, categoryId, type, search, applicationFilter, user?.id]);

  const appliedJobIds = new Set(applications.map((application) => application.job_id));

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Available Jobs</div>
        <div className="card">
          <div className="form-row">
            <label>Search<input value={search} placeholder="Job title or company" onChange={(e) => { setActivePage(1); setSearch(e.target.value); }} /></label>
            <label>Category<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="">All</option>{categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
            <label>Employment Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="">All</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></label>
            {user?.role === 'applicant' && <label>Application status<select value={applicationFilter} onChange={(e) => { setActivePage(1); setApplicationFilter(e.target.value); }}><option value="all">All jobs</option><option value="applied">Applied</option><option value="not-applied">Not applied</option></select></label>}
          </div>
        </div>
        {loading ? <LoaderSpinner text="Loading jobs..." /> : (
          <div className="grid">
            {jobs.map((job) => (
              <article className="card job-card" key={job.id}>
                <div className="job-top"><span className="badge">{job.employment_type}</span><span className="job-company">{job.company_name}</span></div>
                <div className="job-title">{job.title}</div>
                <div className="job-meta">{job.location} • {job.experience_level} • {job.category?.name || 'Category'}</div>
                <div className="job-meta">Salary {job.salary_min} - {job.salary_max}</div>
                <div className="job-meta">{job.is_featured ? 'Featured' : 'Standard'}</div>
                {appliedJobIds.has(job.id) && <span className="badge success">Applied</span>}
                <Link className="button button-primary small" to={`/jobs/${job.id}`}>View Details</Link>
              </article>
            ))}
          </div>
        )}
        <div className="pagination">
          <button className="button button-secondary small" onClick={() => setActivePage(Math.max(1, activePage - 1))}>Prev</button>
          <span className="muted">Page {page}/{pages}</span>
          <button className="button button-secondary small" onClick={() => setActivePage(Math.min(pages, activePage + 1))}>Next</button>
        </div>
      </div>
    </section>
  );
}
