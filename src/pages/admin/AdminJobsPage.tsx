import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { createJob, deleteJob, fetchJobById, fetchJobs, updateJob } from '../../features/jobs/jobsSlice';
import { fetchApplications } from '../../features/applications/applicationsSlice';
import { Job } from '../../types';
import { routes } from '../../constants/routes';
import { LoaderSpinner } from '../../components/LoaderSpinner';
import { Table, Column } from '../../components/Table';

export function AdminJobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector((state: RootState) => state.jobs.list);
  const pagination = useSelector((state: RootState) => state.jobs.pagination);
  const loading = useSelector((state: RootState) => state.jobs.loading);
  const deleting = useSelector((state: RootState) => state.jobs.deleting);
  const error = useSelector((state: RootState) => state.jobs.error);
  const submittingError = useSelector((state: RootState) => state.jobs.submittingError);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    category_id: '',
    is_active: '',
    is_featured: '',
    employment_type: '',
    experience_level: '',
    search: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [current, setCurrent] = useState<Partial<Job>>({});
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const jobColumns: Column<Job>[] = [
    { key: 'title', header: 'Title', render: (job) => job.title },
    { key: 'company_name', header: 'Company', render: (job) => job.company_name },
    { key: 'location', header: 'Location', render: (job) => job.location },
    { key: 'employment_type', header: 'Type', render: (job) => job.employment_type },
    { key: 'is_featured', header: 'Featured', render: (job) => job.is_featured ? 'Yes' : 'No' },
    { key: 'is_active', header: 'Status', render: (job) => <span className="badge success">{job.is_active ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', header: 'Actions', render: (job) => (
      <>
        <button className="button small" onClick={() => openViewApplicants(job)}>View Applicants</button>
        <button className="button small" onClick={() => openDetails(job)}>Details</button>
        <button className="button small" onClick={() => openEdit(job)}>Edit</button>
        <button className="button button-danger small" disabled={deleting} onClick={() => openDelete(job.id)}>Delete</button>
      </>
    )},
  ];

  const activeFilters = useMemo(() => {
    return {
      page,
      limit,
      category_id: filters.category_id ? Number(filters.category_id) : undefined,
      is_active: filters.is_active === '' ? undefined : filters.is_active === 'true',
      is_featured: filters.is_featured === '' ? undefined : filters.is_featured === 'true',
      employment_type: filters.employment_type || undefined,
      experience_level: filters.experience_level || undefined,
      search: filters.search || undefined,
    };
  }, [filters, page, limit]);

  useEffect(() => {
    dispatch(fetchJobs(activeFilters));
  }, [dispatch, activeFilters]);

  function openCreate() {
    setEditingId(null);
    setCurrent({
      title: '',
      company_name: '',
      location: '',
      description: '',
      requirements: '',
      salary_min: '',
      salary_max: '',
      experience_level: 'Entry',
      category_id: 1,
      employment_type: 'full-time',
      is_featured: false,
      is_active: true,
    });
    setShowForm(true);
  }

  function openEdit(job: Job) {
    setEditingId(job.id);
    setCurrent(job);
    setShowForm(true);
  }

  function openDetails(job: Job) {
    setDetailsId(job.id);
    setCurrent(job);
    setShowDetails(true);
  }

  function openDelete(jobId: number) {
    setTargetId(jobId);
    setShowDelete(true);
  }

  function openViewApplicants(job: Job) {
    setSelectedJob(job);
    dispatch(fetchApplications({ job_id: job.id, page: 1, limit: 100 }));
    setShowApplicants(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await dispatch(updateJob({ id: editingId, payload: current }));
    } else {
      await dispatch(createJob(current as Partial<Job>));
    }
    setShowForm(false);
    dispatch(fetchJobs(activeFilters));
  }

  async function confirmDelete() {
    if (!targetId) return;
    await dispatch(deleteJob(targetId));
    setShowDelete(false);
    dispatch(fetchJobs(activeFilters));
  }

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Admin Jobs</div>
        <div className="toolbar">
          <input value={filters.search} placeholder="Search title/company" onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} />
          <select value={filters.category_id} onChange={(e) => { setPage(1); setFilters({ ...filters, category_id: e.target.value }); }}>
            <option value="">All Categories</option>
            <option value="1">Category 1</option>
          </select>
          <select value={filters.is_active} onChange={(e) => { setPage(1); setFilters({ ...filters, is_active: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select value={filters.is_featured} onChange={(e) => { setPage(1); setFilters({ ...filters, is_featured: e.target.value }); }}>
            <option value="">Any Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
          <select value={filters.employment_type} onChange={(e) => { setPage(1); setFilters({ ...filters, employment_type: e.target.value }); }}>
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          <select value={filters.experience_level} onChange={(e) => { setPage(1); setFilters({ ...filters, experience_level: e.target.value }); }}>
            <option value="">All Experience</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
          <button className="button button-primary" onClick={openCreate}>Create Job</button>
        </div>

        {error && <div className="error">{error}</div>}
        {submittingError && <div className="error">{submittingError}</div>}

        {loading ? <LoaderSpinner text="Loading jobs..." /> : (
          <Table
            columns={jobColumns}
            data={jobs}
            emptyMessage="No jobs found"
            keyExtractor={(job) => job.id}
          />
        )}

        {pagination && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} / {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}

        {showForm && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="modal-close" aria-label="Close modal" onClick={() => setShowForm(false)}>×</button>
              <div className="modal-title">{editingId ? 'Edit Job' : 'Create Job'}</div>
              <form className="login-grid" onSubmit={submitForm}>
                <label>Title<input required value={current.title ?? ''} onChange={(e) => setCurrent({ ...current, title: e.target.value })} /></label>
                <label>Company<input required value={current.company_name ?? ''} onChange={(e) => setCurrent({ ...current, company_name: e.target.value })} /></label>
                <label>Location<input required value={current.location ?? ''} onChange={(e) => setCurrent({ ...current, location: e.target.value })} /></label>
                <label>Employment Type<select value={current.employment_type ?? 'full-time'} onChange={(e) => setCurrent({ ...current, employment_type: e.target.value })}><option>full-time</option><option>part-time</option><option>contract</option><option>internship</option></select></label>
                <label>Experience<select value={current.experience_level ?? 'Entry'} onChange={(e) => setCurrent({ ...current, experience_level: e.target.value })}><option>Entry</option><option>Mid</option><option>Senior</option><option>Lead</option></select></label>
                <label>Category ID<input type="number" required value={current.category_id ?? 1} onChange={(e) => setCurrent({ ...current, category_id: Number(e.target.value) })} /></label>
                <label>Status<select value={String(current.is_active ?? true)} onChange={(e) => setCurrent({ ...current, is_active: e.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></label>
                <label>Featured<select value={String(current.is_featured ?? false)} onChange={(e) => setCurrent({ ...current, is_featured: e.target.value === 'true' })}><option value="true">Featured</option><option value="false">Not Featured</option></select></label>
                <label>Description<textarea required value={current.description ?? ''} onChange={(e) => setCurrent({ ...current, description: e.target.value })} /></label>
                <label>Requirements<textarea required value={current.requirements ?? ''} onChange={(e) => setCurrent({ ...current, requirements: e.target.value })} /></label>
                <label>Salary Min<input type="number" value={current.salary_min ?? ''} onChange={(e) => setCurrent({ ...current, salary_min: e.target.value })} /></label>
                <label>Salary Max<input type="number" value={current.salary_max ?? ''} onChange={(e) => setCurrent({ ...current, salary_max: e.target.value })} /></label>
                <div className="modal-actions">
                  <button className="button button-primary" type="submit">Save</button>
                  <button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="modal-close" aria-label="Close modal" onClick={() => setShowDetails(false)}>×</button>
              <div className="modal-title">Job Details</div>
              <div className="login-grid">
                <div><strong>Title:</strong> {current.title}</div>
                <div><strong>Company:</strong> {current.company_name}</div>
                <div><strong>Location:</strong> {current.location}</div>
                <div><strong>Type:</strong> {current.employment_type}</div>
                <div><strong>Experience:</strong> {current.experience_level}</div>
                <div><strong>Featured:</strong> {current.is_featured ? 'Yes' : 'No'}</div>
                <div><strong>Status:</strong> {current.is_active ? 'Active' : 'Inactive'}</div>
                <div><strong>Description:</strong> {current.description}</div>
                <div><strong>Requirements:</strong> {current.requirements}</div>
                <div><strong>Salary:</strong> {current.salary_min ?? ''} - {current.salary_max ?? ''}</div>
              </div>
              <div className="modal-actions">
                <button className="button button-secondary" onClick={() => setShowDetails(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showDelete && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="modal-close" aria-label="Close modal" onClick={() => setShowDelete(false)}>×</button>
              <div className="modal-title">Confirm Delete</div>
              <p>Delete this job and its applications?</p>
              <div className="modal-actions">
                <button className="button button-danger" onClick={confirmDelete}>Delete</button>
                <button className="button button-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
