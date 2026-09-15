export type Role = 'admin' | 'applicant';

export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Intern' | string;
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | string;
export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED' | 'INTERVIEW' | string;

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorData {
  success: false;
  message: string;
  data: null;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface CategoryPayload {
  name: string;
}

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  job_id?: number;
  user_id?: number;
  status?: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
  search?: string;
  applied_date_from?: string;
  applied_date_to?: string;
}

export interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  description: string;
  requirements: string;
  salary_min: number | string;
  salary_max: number | string;
  experience_level: ExperienceLevel;
  category_id: number;
  employment_type: EmploymentType;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Paginated<T> {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: T[];
  rows?: T[];
  data?: T[];
}

export interface JobFilters {
  page?: number;
  limit?: number;
  category_id?: number;
  is_active?: boolean;
  is_featured?: boolean;
  employment_type?: string;
  experience_level?: string;
  search?: string;
  application_status?: string;
  user_id?: number;
}

export interface AuthUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role?: Role;
  profile_photo?: string | null;
}

export interface User {
  id?: number;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role?: Role | { id: number; name: Role };
  profile_photo?: string | null;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface Application {
  id: number;
  job_id: number;
  user_id?: number;
  cover_letter: string;
  resume_url: string;
  status: ApplicationStatus;
  created_at?: string;
  updated_at?: string;
  applied_at?: string;
  job?: Job & { category?: Category };
  user?: User;
}

export interface DashboardTotals {
  users?: number;
  applicants?: number;
  jobs?: number;
  activeJobs?: number;
  applications?: number;
}

export interface DashboardRecentApplicationUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface DashboardRecentApplicationJob {
  id: number;
  title: string;
  company_name: string;
  is_active: boolean;
}

export interface DashboardRecentApplication {
  id: number;
  job_id: number;
  user_id: number;
  cover_letter: string;
  resume_url: string;
  status: string;
  applied_at: string;
  job: DashboardRecentApplicationJob;
  user: DashboardRecentApplicationUser;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  applicationsByStatus?: Record<string, number>;
  recentApplications?: DashboardRecentApplication[];
  applicationsCount?: number;
  statusSummary?: Record<string, number>;
}

export interface UploadResponse {
  url: string;
  filename: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
