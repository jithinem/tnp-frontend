import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  allowedRole?: 'admin' | 'applicant' | 'user';
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');
  const user = useSelector((state: RootState) => state.auth.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if ((allowedRole === 'applicant' || allowedRole === 'user') && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
