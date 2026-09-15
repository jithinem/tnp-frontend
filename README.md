# Job Portal Management System

A React + Vite frontend for the job portal management system.

## Prerequisites

- Node.js and npm
- The backend API running at `http://localhost:5001`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   VITE_API_BASE_URL=http://localhost:5001/api/v1
   VITE_PUBLIC_BASE_URL=http://localhost:5001
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The app will be available at the URL shown by Vite, usually `http://localhost:5173`.

## Other Commands

```bash
npm run build     # Create a production build
npm run preview   # Preview the production build
```

## Login Credentials to the seed users
### Admin
admin@example.com
Admin@123

### Applicant
john@example.com
Applicant@123

## App Features

### Jobs
- Browse all open jobs from the Jobs page.
- View details of a job, including requirements and eligibility.
- Apply for jobs from the job details page if you are logged in as a user.
- Admins can manage job listings, add new jobs, and update categories.

### Applications
- Users can submit and track their applications from the Applications page.
- View application status such as pending, accepted, or rejected.
- Open a specific application to see details and progress.
- Admins can review and manage applications submitted by users.

### Dashboard
- The dashboard gives a quick summary of key stats and activity.
- Users can see their recent application activity and job-related updates.
- Admins can monitor application counts, categories, and overall portal activity.

### Profile
- Update personal information, contact details, and profile settings.
- View account details and keep profile information current.
- Admin users can manage their own profile in the same way.

### Categories
- Admins can create, edit, and manage job categories.
- Categories help organize jobs and make listing filtering easier.
- Users can browse jobs grouped under relevant categories.

## How Applicants and Admins Use the App

### Applicant flow
- Sign in using the applicant account, for example `john@example.com`.
- Go to the Jobs page and browse open positions.
- Open a job to read the description, requirements, and eligibility.
- Click Apply to submit an application.
- Visit the Applications page to track the status of your submissions.
- Use the Dashboard to check recent activity and personal progress.
- Update your profile details from the Profile section whenever needed.

### Admin flow
- Sign in using the admin account, for example `admin@example.com`.
- Open the Dashboard to view portal statistics and recent application activity.
- Manage job listings and categories from the admin pages.
- Review submitted applications and update their status.
- View and manage user-related data from the admin panels.
- Keep the profile information updated for the admin account as required.
