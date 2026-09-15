import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { Application, ApplicationFilters, Paginated, UploadResponse } from '../../types';

interface ApplicationsState {
  list: Application[];
  current: Application | null;
  loading: boolean;
  submitting: boolean;
  uploading: boolean;
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  error: string | null;
}

const initialState: ApplicationsState = {
  list: [],
  current: null,
  loading: false,
  submitting: false,
  uploading: false,
  pagination: null,
  error: null,
};

export const fetchApplications = createAsyncThunk<Paginated<Application>, ApplicationFilters | undefined, { rejectValue: string }>(
  'applications/fetchApplications',
  async (filters = {}, thunkApi) => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.job_id) params.set('job_id', String(filters.job_id));
      if (filters?.user_id) params.set('user_id', String(filters.user_id));
      if (filters?.status) params.set('status', String(filters.status));
      if (filters?.search) params.set('search', String(filters.search));
      if (filters?.applied_date_from) params.set('applied_date_from', String(filters.applied_date_from));
      if (filters?.applied_date_to) params.set('applied_date_to', String(filters.applied_date_to));

      const { data } = await api.get(`/applications?${params.toString()}`);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Applications fetch failed');
      }
      return data.data as Paginated<Application>;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Applications fetch failed'));
    }
  }
);

export const fetchApplicationById = createAsyncThunk<Application, number, { rejectValue: string }>(
  'applications/fetchApplicationById',
  async (id, thunkApi) => {
    try {
      const { data } = await api.get(`/applications/${id}`);
      if (!data?.success || !data?.data) return thunkApi.rejectWithValue(data?.message || 'Application fetch failed');
      return data.data as Application;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Application fetch failed'));
    }
  },
);

export const uploadApplicationFile = createAsyncThunk<UploadResponse, File, { rejectValue: string }>(
  'applications/uploadApplicationFile',
  async (file, thunkApi) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!data?.success || !data?.data?.url) return thunkApi.rejectWithValue(data?.message || 'File upload failed');
      return data.data as UploadResponse;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'File upload failed'));
    }
  },
);

export const createApplication = createAsyncThunk<Application, Partial<Application>, { rejectValue: string }>(
  'applications/createApplication',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post('/applications', payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Application submit failed');
      }
      return data.data as Application;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Application submit failed'));
    }
  }
);

export const updateApplication = createAsyncThunk<Application, { id: number; payload: Partial<Application> }, { rejectValue: string }>(
  'applications/updateApplication',
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.put(`/applications/${id}`, payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Application update failed');
      }
      return data.data as Application;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Application update failed'));
    }
  }
);

export const deleteApplication = createAsyncThunk<number, number, { rejectValue: string }>(
  'applications/deleteApplication',
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/applications/${id}`);
      if (!data?.success) {
        return thunkApi.rejectWithValue(data?.message || 'Application delete failed');
      }
      return id;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Application delete failed'));
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || action.payload.rows || action.payload.data || [];
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages,
        };
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch applications';
      })
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch application';
      })
      .addCase(uploadApplicationFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadApplicationFile.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadApplicationFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload || 'File upload failed';
      })
      .addCase(createApplication.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.submitting = false;
        state.list.unshift(action.payload);
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Application submit failed';
      })
      .addCase(updateApplication.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.submitting = false;
        state.list = state.list.map((app) => app.id === action.payload.id ? action.payload : app);
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Application update failed';
      })
      .addCase(deleteApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((app) => app.id !== action.payload);
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Application delete failed';
      });
  },
});

export default applicationsSlice.reducer;
