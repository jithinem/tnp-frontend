import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import jobsReducer from '../features/jobs/jobsSlice';
import categoriesReducer from '../features/jobs/categoriesSlice';
import applicationsReducer from '../features/applications/applicationsSlice';
import dashboardReducer from '../features/jobs/dashboardSlice';
import usersReducer from '../features/users/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    categories: categoriesReducer,
    applications: applicationsReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
