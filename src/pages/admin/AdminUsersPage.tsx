import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../features/users/usersSlice';
import { User } from '../../types';
import { LoaderSpinner } from '../../components/LoaderSpinner';
import { Table, Column } from '../../components/Table';

export function AdminUsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.users.list);
  const pagination = useSelector((state: RootState) => state.users.pagination);
  const loading = useSelector((state: RootState) => state.users.loading);
  const submitting = useSelector((state: RootState) => state.users.submitting);
  const error = useSelector((state: RootState) => state.users.error);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ role: '', search: '', is_active: '' });
  const [current, setCurrent] = useState<Partial<User>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const roleName = (role: User['role']) => typeof role === 'object' ? role.name : role;

  const userColumns: Column<User>[] = [
    { key: 'id', header: 'ID', render: (user) => user.id },
    { key: 'name', header: 'Name', render: (user) => (
      <button className="button small" onClick={() => openApplicantDetails(user)}>{`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || '—'}</button>
    )},
    { key: 'email', header: 'Email', render: (user) => user.email },
    { key: 'phone_number', header: 'Phone', render: (user) => user.phone_number || '—' },
    { key: 'role', header: 'Role', render: (user) => roleName(user.role) },
    { key: 'status', header: 'Status', render: (user) => <span className="badge success">{user.is_active ? 'Active' : 'Inactive'}</span> },
    { key: 'created_at', header: 'Created', render: (user) => user.created_at || '—' },
    { key: 'actions', header: 'Actions', render: (user) => (
      <>
        <button className="button small" onClick={() => openEdit(user)}>Edit</button>
        <button className="button button-danger small" disabled={submitting} onClick={() => openDelete(user.id ?? 0)}>Delete</button>
      </>
    )},
  ];

  const activeFilters = useMemo(() => {
    return {
      page,
      limit,
      role: filters.role || undefined,
      search: filters.search || undefined,
      is_active: filters.is_active === '' ? undefined : filters.is_active === 'true',
    };
  }, [filters, page, limit]);

  useEffect(() => {
    dispatch(fetchUsers(activeFilters));
  }, [dispatch, activeFilters]);

  function openCreate() {
    setEditingId(null);
    setCurrent({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      role: 'applicant',
      is_active: true,
    });
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditingId(user.id ?? null);
    setCurrent(user);
    setShowForm(true);
  }

  function openDetails(user: User) {
    setDetailsId(user.id ?? null);
    setCurrent(user);
    setShowDetails(true);
  }

  function openApplicantDetails(user: User) {
    setDetailsId(user.id ?? null);
    setCurrent(user);
    setShowDetails(true);
  }

  function openDelete(userId: number) {
    setTargetId(userId);
    setShowDelete(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await dispatch(updateUser({ id: editingId, payload: current }));
    } else {
      await dispatch(createUser(current as Partial<User>));
    }
    setShowForm(false);
    dispatch(fetchUsers(activeFilters));
  }

  async function confirmDelete() {
    if (!targetId) return;
    await dispatch(deleteUser(targetId));
    setShowDelete(false);
    dispatch(fetchUsers(activeFilters));
  }

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Users</div>
        <div className="toolbar">
          <input value={filters.search} placeholder="Search name/email" onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} />
          <select value={filters.role} onChange={(e) => { setPage(1); setFilters({ ...filters, role: e.target.value }); }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="applicant">Applicant</option>
          </select>
          <select value={filters.is_active} onChange={(e) => { setPage(1); setFilters({ ...filters, is_active: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button className="button button-primary" onClick={openCreate}>Create User</button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? <LoaderSpinner text="Loading users..." /> : (
          <Table
            columns={userColumns}
            data={users}
            emptyMessage="No users found"
            keyExtractor={(user) => user.id}
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
              <div className="modal-title">{editingId ? 'Edit User' : 'Create User'}</div>
              <form className="login-grid" onSubmit={submitForm}>
                <label>First Name<input required value={current.first_name ?? ''} onChange={(e) => setCurrent({ ...current, first_name: e.target.value })} /></label>
                <label>Last Name<input required value={current.last_name ?? ''} onChange={(e) => setCurrent({ ...current, last_name: e.target.value })} /></label>
                <label>Email<input type="email" required value={current.email ?? ''} onChange={(e) => setCurrent({ ...current, email: e.target.value })} /></label>
                <label>Phone Number<input type="tel" value={current.phone_number ?? ''} onChange={(e) => setCurrent({ ...current, phone_number: e.target.value })} placeholder="+1 234 567 8900" /></label>
                <label>Role<select value={roleName(current.role) ?? 'applicant'} onChange={(e) => setCurrent({ ...current, role: e.target.value as User['role'] })}><option value="admin">admin</option><option value="applicant">applicant</option></select></label>
                <label>Status<select value={String(current.is_active ?? true)} onChange={(e) => setCurrent({ ...current, is_active: e.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></label>
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
              <div className="modal-title">User Details</div>
              <div className="login-grid">
                <div><strong>Name:</strong> {`${current.first_name ?? ''} ${current.last_name ?? ''}`.trim()}</div>
                <div><strong>Email:</strong> {current.email}</div>
                <div><strong>Phone:</strong> {current.phone_number || '—'}</div>
                <div><strong>Role:</strong> {roleName(current.role)}</div>
                <div><strong>Status:</strong> {current.is_active ? 'Active' : 'Inactive'}</div>
                <div><strong>Created:</strong> {current.created_at || '—'}</div>
                {current.profile_photo && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Profile Photo:</strong><br />
                    <img 
                      src={current.profile_photo} 
                      alt="Profile" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginTop: '8px' }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
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
              <p>Delete this user?</p>
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
