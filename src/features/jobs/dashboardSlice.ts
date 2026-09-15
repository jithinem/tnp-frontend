import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { DashboardSummary } from '../../types';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk<DashboardSummary, void, { rejectValue: string }>(
  'dashboard/fetchAdminDashboard',
  async (_payload, thunkApi) => {
    try {
      const { data } = await api.get('/dashboard/admin');
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Dashboard fetch failed');
      }
      return data.data as DashboardSummary;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Dashboard fetch failed'));
    }
  }
);

export const fetchApplicantDashboard = createAsyncThunk<DashboardSummary, void, { rejectValue: string }>(
  'dashboard/fetchApplicantDashboard',
  async (_payload, thunkApi) => {
    try {
      const { data } = await api.get('/dashboard/applicant');
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Dashboard fetch failed');
      }
      return data.data as DashboardSummary;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Dashboard fetch failed'));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Dashboard fetch failed';
      })
      .addCase(fetchApplicantDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicantDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchApplicantDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Dashboard fetch failed';
      });
  },
});

export default dashboardSlice.reducer;
