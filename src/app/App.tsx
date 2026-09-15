import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminJobsPage } from '../pages/admin/AdminJobsPage';
import { AdminApplicationsPage } from '../pages/admin/AdminApplicationsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { UserLoginPage } from '../pages/user/UserLoginPage';
import { LandingPage } from '../pages/user/LandingPage';
import { JobsPage } from '../pages/user/JobsPage';
import { JobDetailsPage } from '../pages/user/JobDetailsPage';
import { DashboardPage } from '../pages/user/DashboardPage';
import { ApplicationFormPage } from '../pages/user/ApplicationFormPage';
import { ProfilePage } from '../pages/user/ProfilePage';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { ForgotPasswordPage } from '../pages/user/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/user/ResetPasswordPage';
import { SignupPage } from '../pages/user/SignupPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ApplicationDetailsPage } from '../pages/user/ApplicationDetailsPage';
import { ApplicationsPage } from '../pages/user/ApplicationsPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        <Route element={<ProtectedRoute allowedRole="applicant" />}>
          <Route path="/apply/:jobId" element={<ApplicationFormPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
