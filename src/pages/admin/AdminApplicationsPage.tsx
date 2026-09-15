import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store/store';
import { fetchApplications, updateApplication, deleteApplication } from '../../features/applications/applicationsSlice';
import { fetchJobs } from '../../features/jobs/jobsSlice';
import { Application, ApplicationFilters, Job } from '../../types';
import { LoaderSpinner } from '../../components/LoaderSpinner';
import { Table, Column } from '../../components/Table';

export function AdminApplicationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const apps = useSelector((state: RootState) => state.applications.list);
  const pagination = useSelector((state: RootState) => state.applications.pagination);
  const loading = useSelector((state: RootState) => state.applications.loading);
  const submitting = useSelector((state: RootState) => state.applications.submitting);
  const error = useSelector((state: RootState) => state.applications.error);
  const jobs = useSelector((state: RootState) => state.jobs.list);

  const queryStatus = new URLSearchParams(location.search).get('status') || '';
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    job_id: '',
    user_id: '',
    status: queryStatus,
    search: '',
  });
  const [current, setCurrent] = useState<Partial<Application>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showApplicantDetails, setShowApplicantDetails] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  const applicationColumns: Column<Application>[] = [
    { key: 'id', header: 'ID', render: (app) => app.id },
    { key: 'applicant', header: 'Applicant', render: (app) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {app.user?.profile_photo && (
          <img 
            src={app.user.profile_photo} 
            alt="Profile" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div>
          <button className="button small" onClick={() => openApplicantDetails(app)}>{`${app.user?.first_name || ''} ${app.user?.last_name || ''}`.trim() || app.user_id}</button>
          {app.user?.phone_number && <div className="muted" style={{ fontSize: '11px' }}>{app.user.phone_number}</div>}
        </div>
      </div>
    )},
    { key: 'job', header: 'Job', render: (app) => (
      <>
        {app.job?.title || app.job_id}<br /><span className="muted">{app.job?.company_name || '—'}</span>
      </>
    )},
    { key: 'category', header: 'Category', render: (app) => app.job?.category?.name || app.job?.category_id || '—' },
    { key: 'status', header: 'Status', render: (app) => app.status },
    { key: 'applied', header: 'Applied', render: (app) => app.created_at || app.applied_at || '—' },
    { key: 'actions', header: 'Actions', render: (app) => (
      <div className="table-actions">
        <button className="button small" onClick={() => navigate(`/applications/${app.id}`)}>Details</button>
        <button className="button small" onClick={() => openEdit(app)}>Edit</button>
        <button className="button button-danger small" disabled={submitting} onClick={() => openDelete(app.id)}>Delete</button>
      </div>
    )},
  ];

  const activeFilters = useMemo<ApplicationFilters>(() => {
    return {
      page,
      limit,
      job_id: filters.job_id ? Number(filters.job_id) : undefined,
      user_id: filters.user_id ? Number(filters.user_id) : undefined,
      status: filters.status ? filters.status as ApplicationFilters['status'] : undefined,
      search: filters.search || undefined,
    };
  }, [filters, page, limit]);

  const handleFilterChange = () => {
    setPage(1);
  };

  useEffect(() => {
    dispatch(fetchJobs({ page: 1, limit: 100 }));
    dispatch(fetchApplications(activeFilters));
  }, [dispatch, activeFilters]);

  function openEdit(app: Application) {
    setEditingId(app.id);
    setCurrent(app);
    setShowForm(true);
  }

  function openDelete(appId: number) {
    setTargetId(appId);
    setShowDelete(true);
  }

  function openApplicantDetails(app: Application) {
    setSelectedApplicant(app.user);
    setShowApplicantDetails(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) await dispatch(updateApplication({ id: editingId, payload: current }));
    setShowForm(false);
    dispatch(fetchApplications(activeFilters));
  }

  async function confirmDelete() {
    if (!targetId) return;
    await dispatch(deleteApplication(targetId));
    setShowDelete(false);
    dispatch(fetchApplications(activeFilters));
  }

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Applications</div>
        <div className="toolbar">
          <input value={filters.search} placeholder="Search applicant, company, or job" onChange={(e) => { setFilters({ ...filters, search: e.target.value }); handleFilterChange(); }} />
          <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); handleFilterChange(); }}>
            <option value="">All Status</option>
            <option value="PENDING">PENDING</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <select value={filters.job_id} onChange={(e) => { setFilters({ ...filters, job_id: e.target.value }); handleFilterChange(); }}>
            <option value="">All Jobs</option>
            {jobs.map((job: Job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <input type="number" placeholder="User ID" value={filters.user_id} onChange={(e) => { setFilters({ ...filters, user_id: e.target.value }); handleFilterChange(); }} />
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? <LoaderSpinner text="Loading applications..." /> : (
          <Table
            columns={applicationColumns}
            data={apps}
            emptyMessage="No applications found"
            keyExtractor={(app) => app.id}
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
              <div className="modal-title">Edit Application</div>
              <form className="login-grid" onSubmit={submitForm}>
                <label>Job<select value={current.job_id ?? 1} onChange={(e) => setCurrent({ ...current, job_id: Number(e.target.value) })}>{jobs.map((j: Job) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></label>
                <label>Status<select value={current.status ?? 'PENDING'} onChange={(e) => setCurrent({ ...current, status: e.target.value as Application['status'] })}><option>PENDING</option><option>SHORTLISTED</option><option>REJECTED</option></select></label>
                <label>Cover Letter<textarea value={current.cover_letter ?? ''} onChange={(e) => setCurrent({ ...current, cover_letter: e.target.value })} /></label>
                <label>Resume URL<input value={current.resume_url ?? ''} onChange={(e) => setCurrent({ ...current, resume_url: e.target.value })} /></label>
                <div className="modal-actions">
                  <button className="button button-primary" type="submit">Save</button>
                  <button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {showDelete && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="modal-close" aria-label="Close modal" onClick={() => setShowDelete(false)}>×</button>
              <div className="modal-title">Confirm Delete</div>
              <p>Delete this application?</p>
              <div className="modal-actions">
                <button className="button button-danger" onClick={confirmDelete}>Delete</button>
                <button className="button button-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showApplicantDetails && selectedApplicant && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="modal-close" aria-label="Close modal" onClick={() => setShowApplicantDetails(false)}>×</button>
              <div className="modal-title">Applicant Details</div>
              <div className="login-grid">
                <div><strong>Name:</strong> {`${selectedApplicant.first_name || ''} ${selectedApplicant.last_name || ''}`.trim()}</div>
                <div><strong>Email:</strong> {selectedApplicant.email}</div>
                <div><strong>Phone:</strong> {selectedApplicant.phone_number || '—'}</div>
                {selectedApplicant.profile_photo && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Profile Photo:</strong><br />
                    <img 
                      src={selectedApplicant.profile_photo} 
                      alt="Profile" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginTop: '8px' }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="button button-secondary" onClick={() => setShowApplicantDetails(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
