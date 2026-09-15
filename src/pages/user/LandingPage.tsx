import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/jobs/categoriesSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Link } from 'react-router-dom';

export function LandingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector((state: RootState) => state.jobs.list);
  const categories = useSelector((state: RootState) => state.categories.list);
  const jobLoading = useSelector((state: RootState) => state.jobs.loading);

  useEffect(() => {
    dispatch(fetchJobs({ page: 1, limit: 6 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div>
            <span className="badge">Career Network</span>
            <h1>Find your next career move</h1>
            <p>Explore curated roles, remote opportunities, and top employers.</p>
            <div className="form-actions">
              <Link className="button button-primary" to="/jobs">Explore Jobs</Link>
              <Link className="button button-secondary" to="/dashboard">Applicant Dashboard</Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="mini-title">Today’s Snapshot</div>
            <div className="hero-stat"><span>Open Positions</span><strong>{jobs.length || 24}</strong></div>
            <div className="hero-stat"><span>Categories</span><strong>{categories.length || 8}</strong></div>
            <div className="hero-stat"><span>Hiring Partners</span><strong>128+</strong></div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="app-shell-inner">
          <div className="section-title">Featured Jobs</div>
          {jobLoading ? <div>Loading...</div> : (
            <div className="grid">
              {jobs.slice(0, 6).map((job) => (
                <article className="card job-card" key={job.id}>
                  <div className="job-top">
                    <span className="badge">{job.employment_type}</span>
                    <span className="job-company">{job.company_name}</span>
                  </div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-meta">{job.location} • {job.experience_level}</div>
                  <div className="job-meta">{job.category?.name || 'Engineering'}</div>
                  <div className="job-meta">Salary {job.salary_min} - {job.salary_max}</div>
                  <Link className="button button-secondary small" to={`/jobs/${job.id}`}>View Details</Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="app-shell-inner">
          <div className="section-title">Browse by Category</div>
          <div className="grid">
            {categories.length ? categories.map((category) => (
              <article className="card" key={category.id}>
                <div className="job-title">{category.name}</div>
                <div className="muted">{category.slug}</div>
              </article>
            )) : <div>No categories available</div>}
          </div>
        </div>
      </section>
    </>
  );
}
