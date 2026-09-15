import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationById, updateApplication, uploadApplicationFile } from '../../features/applications/applicationsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { ApplicationStatus } from '../../types';
import { LoaderSpinner } from '../../components/LoaderSpinner';
import { API_BASE_URL } from '../../api/client';

export function ApplicationDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { current, loading, submitting, uploading, error } = useSelector((state: RootState) => state.applications);
  const user = useSelector((state: RootState) => state.auth.user);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('PENDING');
  const [fileError, setFileError] = useState('');

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

  useEffect(() => {
    if (id) dispatch(fetchApplicationById(Number(id)));
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      setCoverLetter(current.cover_letter || '');
      setResumeUrl(current.resume_url || '');
      setStatus(current.status);
    }
  }, [current]);

  async function uploadResume(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFileError('Files must be 5 MB or smaller.'); return; }
    setFileError('');
    const result = await dispatch(uploadApplicationFile(file));
    if (uploadApplicationFile.fulfilled.match(result)) {
      setResumeUrl(result.payload.url);
      // Auto-save when resume is uploaded
      if (current) {
        await dispatch(updateApplication({ id: current.id, payload: { resume_url: result.payload.url } }));
      }
    }
  }

  async function handleStatusChange(newStatus: ApplicationStatus) {
    setStatus(newStatus);
    if (current && isAdmin) {
      await dispatch(updateApplication({ id: current.id, payload: { status: newStatus } }));
    }
  }

  async function handleCoverLetterChange(newCoverLetter: string) {
    setCoverLetter(newCoverLetter);
    // Auto-save cover letter changes
    if (current && !isAdmin) {
      await dispatch(updateApplication({ id: current.id, payload: { cover_letter: newCoverLetter } }));
    }
  }

  if (loading) return <section className="page-section"><div className="app-shell-inner"><LoaderSpinner text="Loading application..." /></div></section>;
  if (!current) return <section className="page-section"><div className="app-shell-inner"><div className="error">{error || 'Application not found.'}</div></div></section>;

  const isAdmin = user?.role === 'admin';
  return <section className="page-section"><div className="app-shell-inner"><div className="section-title">Application Details</div>
    <div className="card">
      <div className="application-details-header">
        <div className="application-info">
          <h2>{current.job?.title || current.job_id}</h2>
          <p className="company-name">{current.job?.company_name || '—'}</p>
          <div className="application-meta">
            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Applicant:</strong> 
              {current.user?.profile_photo && (
                <img 
                  src={assetUrl(current.user.profile_photo)} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              <span>{current.user ? `${current.user.first_name || ''} ${current.user.last_name || ''}`.trim() : 'You'}</span>
            </div>
            {current.user?.phone_number && <span className="meta-item"><strong>Phone:</strong> {current.user.phone_number}</span>}
            <span className="meta-item"><strong>Status:</strong> <span className={`badge ${current.status === 'SHORTLISTED' ? 'success' : current.status === 'REJECTED' ? 'warning' : 'dark'}`}>{current.status}</span></span>
            <span className="meta-item"><strong>Applied:</strong> {current.applied_at || current.created_at || '—'}</span>
          </div>
        </div>
      </div>
      <div className="login-grid">
        {!isAdmin && <>
          <label>Cover Letter
            <textarea value={coverLetter} maxLength={2000} onChange={(event) => handleCoverLetterChange(event.target.value)} placeholder="Write your cover letter here..." />
          </label>
          <label>Replace Resume
            <input type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" onChange={(event) => uploadResume(event.target.files?.[0])} />
          </label>
          {resumeUrl && <div className="resume-link"><a className="button button-secondary small" href={resumeUrl} target="_blank" rel="noreferrer">View Current Resume</a></div>}
        </>}
        {isAdmin && <label>Status<select value={status} onChange={(event) => handleStatusChange(event.target.value as ApplicationStatus)} disabled={submitting}><option value="PENDING">Pending</option><option value="SHORTLISTED">Shortlisted</option><option value="REJECTED">Rejected</option></select></label>}
        {fileError && <div className="error">{fileError}</div>}{error && <div className="error">{error}</div>}
        <div className="form-actions"><Link className="button button-secondary" to={isAdmin ? '/admin/applications' : '/dashboard'}>Back</Link></div>
      </div>
    </div>
  </div></section>;
}
