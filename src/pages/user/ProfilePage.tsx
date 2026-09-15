import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser, updateMyProfile, uploadProfilePhoto } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import { API_BASE_URL } from '../../api/client';

export function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone_number: '', profile_photo: '' });

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  useEffect(() => { if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone_number: user.phone_number || '', profile_photo: user.profile_photo || '' }); }, [user]);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return;
    const result = await dispatch(uploadProfilePhoto(file));
    if (uploadProfilePhoto.fulfilled.match(result)) {
      const profile_photo = assetUrl(result.payload.url);
      setForm((current) => ({ ...current, profile_photo }));
      await dispatch(updateMyProfile({ profile_photo }));
    }
  }
  async function saveProfile(event: FormEvent) { event.preventDefault(); await dispatch(updateMyProfile(form)); }
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

  if (loading) {
    return <section className='page-section'><div className='app-shell-inner'>Loading profile...</div></section>;
  }

  if (!user) {
    return <section className='page-section'><div className='app-shell-inner'><div className='section-title'>Profile</div><div className='error'>{error || 'Please login to view your profile.'}</div></div></section>;
  }

  return (
    <section className='page-section'>
      <div className='app-shell-inner'>
        <div className='section-title'>My Profile</div>
        <div className='profile-layout'>
          <aside className='profile-summary card'>
            <div className='avatar'>
              {form.profile_photo ? (
                <img 
                  src={assetUrl(form.profile_photo)} 
                  alt="Profile" 
                  onError={(event) => { 
                    console.error('Image load error:', form.profile_photo);
                    event.currentTarget.style.display = 'none'; 
                  }}
                  onLoad={(event) => {
                    console.log('Image loaded successfully:', form.profile_photo);
                  }}
                />
              ) : (
                <span>{(user.first_name || user.email).slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <h2>{`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Applicant'}</h2><p className='muted'>{user.email}</p><span className='badge success'>Applicant</span>
          </aside>
          <form className='form login-grid' onSubmit={saveProfile}>
            <h2>Profile details</h2>
            <div className='form-row'><label>First name<input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label><label>Last name<input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label></div>
            <label>Email<input value={user.email} disabled /></label>
            <label>Phone Number<input type='tel' value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+1 234 567 8900" /></label>
            <label>Profile photo<input type='file' accept='image/jpeg,image/png,image/webp' onChange={uploadPhoto} /></label>
            <p className='muted'>JPEG, PNG, or WebP, up to 5 MB.</p>{error && <p className='error'>{error}</p>}
            <div className='form-actions'><button className='button button-primary' disabled={loading}>{loading ? 'Saving...' : 'Save profile'}</button></div>
          </form>
        </div>
      </div>
    </section>
  );
}
