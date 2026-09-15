import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { createCategory, deleteCategory, fetchCategoriesPage, fetchCategoryById, updateCategory } from '../../features/jobs/categoriesSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Category } from '../../types';
import { Table, Column } from '../../components/Table';

export function AdminCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, pagination, current, loading, submitting, error } = useSelector((state: RootState) => state.categories);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [search, setSearch] = useState('');

  const categoryColumns: Column<Category>[] = [
    { key: 'name', header: 'Name', render: (category) => category.name },
    { key: 'slug', header: 'Slug', render: (category) => category.slug || '—' },
    { key: 'actions', header: 'Actions', render: (category) => (
      <>
        <button className="button small" onClick={() => viewDetails(category)}>Details</button>
        <button className="button small" onClick={() => { setEditing(category); setName(category.name); }}>Edit</button>
        <button className="button button-danger small" disabled={submitting} onClick={() => setDeleteTarget(category)}>Delete</button>
      </>
    )},
  ];

  useEffect(() => {
    dispatch(fetchCategoriesPage({ page, limit: 10 }));
  }, [dispatch, page]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = editing
      ? await dispatch(updateCategory({ id: editing.id, payload: { name } }))
      : await dispatch(createCategory({ name }));
    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      setName('');
      setEditing(null);
      dispatch(fetchCategoriesPage({ page, limit: 10 }));
    }
  }

  async function viewDetails(category: Category) {
    const result = await dispatch(fetchCategoryById(category.id));
    if (fetchCategoryById.fulfilled.match(result)) setDetailsOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await dispatch(deleteCategory(deleteTarget.id));
    if (deleteCategory.fulfilled.match(result)) {
      setDeleteTarget(null);
      if (list.length === 1 && page > 1) setPage(page - 1);
      else dispatch(fetchCategoriesPage({ page, limit: 10 }));
    }
  }
  const visibleCategories = list.filter((category) => `${category.name} ${category.slug || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="section-title">Category Management</div>
        <div className="toolbar"><input value={search} placeholder="Search categories" onChange={(event) => setSearch(event.target.value)} /></div>
        <form className="toolbar" onSubmit={submit}>
          <input required maxLength={150} value={name} placeholder="Category name" onChange={(event) => setName(event.target.value)} />
          <button className="button button-primary" disabled={submitting}>{editing ? 'Save Category' : 'Add Category'}</button>
          {editing && <button className="button button-secondary" type="button" onClick={() => { setEditing(null); setName(''); }}>Cancel</button>}
        </form>
        {error && <div className="error">{error}</div>}
        {loading ? <div>Loading categories...</div> : list.length === 0 ? <div className="form muted">No categories yet.</div> : (
          <div className="table-wrap">
            <Table
              columns={categoryColumns}
              data={visibleCategories}
              emptyMessage="No matching categories"
              keyExtractor={(category) => category.id}
            />
          </div>
        )}
        {pagination && <div className="pagination">
          <button className="button button-secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pagination.pages || 1}</span>
          <button className="button button-secondary small" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>}
        {detailsOpen && current && <div className="modal-backdrop"><div className="modal">
          <button className="modal-close" aria-label="Close modal" onClick={() => setDetailsOpen(false)}>×</button>
          <div className="modal-title">Category Details</div><div className="login-grid"><div><strong>Name:</strong> {current.name}</div><div><strong>Slug:</strong> {current.slug || '—'}</div></div>
          <div className="modal-actions"><button className="button button-secondary" onClick={() => setDetailsOpen(false)}>Close</button></div>
        </div></div>}
        <ConfirmationModal open={Boolean(deleteTarget)} message={`Delete ${deleteTarget?.name || 'this category'}? Categories assigned to jobs cannot be deleted.`} loading={submitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    </section>
  );
}
