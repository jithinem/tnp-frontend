import { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createApplication, uploadApplicationFile } from '../../features/applications/applicationsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { LoaderSpinner } from '../../components/LoaderSpinner';

export function ApplicationFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const submitting = useSelector((state: RootState) => state.applications.submitting);
  const uploading = useSelector((state: RootState) => state.applications.uploading);
  const error = useSelector((state: RootState) => state.applications.error);
  const [form, setForm] = useState({ cover_letter: '', resume_url: '', status: 'PENDING' });
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setFileError('Choose a PDF, text file, JPEG, PNG, or WebP file under 5 MB.');
      event.target.value = '';
      return;
    }

    setFileError('');
    const result = await dispatch(uploadApplicationFile(file));
    if (uploadApplicationFile.fulfilled.match(result)) {
      setFileName(result.payload.originalName || file.name);
      setForm((previous) => ({ ...previous, resume_url: result.payload.url }));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(createApplication({
      job_id: Number(jobId),
      cover_letter: form.cover_letter,
      resume_url: form.resume_url,
      status: 'PENDING',
    }));
    if (createApplication.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  }

  return (
    <section className="page-section">
      <div className="app-shell-inner">
        <div className="login">
          <h1>Apply for Job</h1>
          <div className="muted">Applicant: {authUser?.email || 'Guest'}</div>
          <form className="login-grid" onSubmit={submit}>
            <label>Cover Letter<textarea value={form.cover_letter} required onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} /></label>
            <label>
              Resume
              <input type="file" required accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
            </label>
            {uploading && <LoaderSpinner size="small" text="Uploading resume..." />}
            {fileName && <div className="success">Uploaded: {fileName}</div>}
            {fileError && <div className="error">{fileError}</div>}
            {error && <div className="error">{error}</div>}
            <button className="button button-primary" disabled={submitting || uploading || !form.resume_url}>{submitting ? <LoaderSpinner size="small" inline /> : 'Submit Application'}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
