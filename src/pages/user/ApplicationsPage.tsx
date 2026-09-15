import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '../../features/applications/applicationsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { LoaderSpinner } from '../../components/LoaderSpinner';
import { Table, Column } from '../../components/Table';
import { API_BASE_URL } from '../../api/client';

export function ApplicationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, pagination } = useSelector((state: RootState) => state.applications);
  const user = useSelector((state: RootState) => state.auth.user);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [page, setPage] = useState(1);

  function assetUrl(value: string) {
    if (!value) return '';
    const apiOrigin = new URL(API_BASE_URL).origin;
    try { 
      const parsed = new URL(value); 
      return parsed.pathname.startsWith('/public/') ? `${apiOrigin}${parsed.pathname}` : value; 
    } catch { 
      return value.startsWith('/public/') ? `${apiOrigin}${value}` : value; 
    }
  }

  const applicationColumns: Column<any>[] = [
    { key: 'company', header: 'Company', render: (app) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user?.profile_photo && (
          <img 
            src={assetUrl(user.profile_photo)} 
            alt="Profile" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span>{app.job?.company_name || '—'}</span>
      </div>
    )},
    { key: 'job', header: 'Job', render: (app) => app.job?.title || app.job_id },
    { key: 'status', header: 'Status', render: (app) => <span className="badge success">{app.status}</span> },
    { key: 'applied', header: 'Applied', render: (app) => app.applied_at || app.created_at || '—' },
    { key: 'actions', header: '', render: (app) => <Link className="button small" to={`/applications/${app.id}`}>View</Link> },
  ];

  useEffect(() => {
    dispatch(fetchApplications({
      page,
      limit: 10,
      search: search || undefined,
      status: status as 'PENDING' | 'SHORTLISTED' | 'REJECTED' || undefined,
      applied_date_from: appliedDateFrom || undefined,
      applied_date_to: appliedDateTo || undefined,
    }));
  }, [dispatch, page, search, status, appliedDateFrom, appliedDateTo]);

  const handleFilterChange = () => {
    setPage(1);
  };

  return <section className="page-section"><div className="app-shell-inner"><div className="section-title">My Applications</div>
    <div className="toolbar">
      <input value={search} placeholder="Search job or company" onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
      <select value={status} onChange={(e) => { setStatus(e.target.value); handleFilterChange(); }}>
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="SHORTLISTED">Shortlisted</option>
        <option value="REJECTED">Rejected</option>
      </select>
      <label className="date-range-label">Applied Date
        <div className="date-range-inputs">
          <input type="date" value={appliedDateFrom} onChange={(e) => { setAppliedDateFrom(e.target.value); handleFilterChange(); }} placeholder="From" />
          <span className="date-separator">to</span>
          <input type="date" value={appliedDateTo} onChange={(e) => { setAppliedDateTo(e.target.value); handleFilterChange(); }} placeholder="To" />
        </div>
      </label>
    </div>
    {loading ? <LoaderSpinner text="Loading applications..." /> : (
      <div className="table-wrap">
        <Table
          columns={applicationColumns}
          data={list}
          emptyMessage="No matching applications"
          keyExtractor={(app) => app.id}
        />
      </div>
    )}
    {pagination && <div className="pagination"><button className="button button-secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pagination.pages || 1}</span><button className="button button-secondary small" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
  </div></section>;
}
