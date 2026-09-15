import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { Job, JobFilters, Paginated } from '../../types';

interface JobsState {
  list: Job[];
  current: Job | null;
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  loading: boolean;
  loadJobLoading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  submittingError: string | null;
}

const initialState: JobsState = {
  list: [],
  current: null,
  pagination: null,
  loading: false,
  loadJobLoading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  submittingError: null,
};

export const fetchJobs = createAsyncThunk<Paginated<Job>, JobFilters | undefined, { rejectValue: string }>(
  'jobs/fetchJobs',
  async (filters = {}, thunkApi) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.category_id) params.set('category_id', String(filters.category_id));
      if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active));
      if (filters.is_featured !== undefined) params.set('is_featured', String(filters.is_featured));
      if (filters.employment_type) params.set('employment_type', filters.employment_type);
      if (filters.experience_level) params.set('experience_level', filters.experience_level);
      if (filters.search) params.set('search', filters.search);
      if (filters.application_status) params.set('application_status', filters.application_status);
      if (filters.user_id) params.set('user_id', String(filters.user_id));

      const { data } = await api.get(`/jobs?${params.toString()}`);
      if (!data?.success) {
        return thunkApi.rejectWithValue(data?.message || 'Jobs fetch failed');
      }

      return data.data as Paginated<Job>;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Jobs fetch failed'));
    }
  }
);

export const fetchJobById = createAsyncThunk<Job, number, { rejectValue: string }>(
  'jobs/fetchJobById',
  async (id, thunkApi) => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Job fetch failed');
      }
      return data.data as Job;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Job fetch failed'));
    }
  }
);

export const createJob = createAsyncThunk<Job, Partial<Job>, { rejectValue: string }>(
  'jobs/createJob',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post('/jobs', payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Create job failed');
      }
      return data.data as Job;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Create job failed'));
    }
  }
);

export const updateJob = createAsyncThunk<Job, { id: number; payload: Partial<Job> }, { rejectValue: string }>(
  'jobs/updateJob',
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.put(`/jobs/${id}`, payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Update job failed');
      }
      return data.data as Job;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Update job failed'));
    }
  }
);

export const deleteJob = createAsyncThunk<number, number, { rejectValue: string }>(
  'jobs/deleteJob',
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/jobs/${id}`);
      if (!data?.success) {
        return thunkApi.rejectWithValue(data?.message || 'Delete job failed');
      }
      return id;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Delete job failed'));
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || action.payload.rows || action.payload.data || [];
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages,
        };
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch jobs';
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loadJobLoading = true;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loadJobLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loadJobLoading = false;
        state.error = action.payload || 'Unable to fetch job details';
      })
      .addCase(createJob.pending, (state) => {
        state.creating = true;
        state.submittingError = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.creating = false;
        state.list.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.creating = false;
        state.submittingError = action.payload || 'Create job failed';
      })
      .addCase(updateJob.pending, (state) => {
        state.updating = true;
        state.submittingError = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.updating = false;
        state.current = action.payload;
        state.list = state.list.map((job) => job.id === action.payload.id ? action.payload : job);
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.updating = false;
        state.submittingError = action.payload || 'Update job failed';
      })
      .addCase(deleteJob.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.deleting = false;
        state.list = state.list.filter((job) => job.id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Delete job failed';
      });
  },
});

export const { clearJobError } = jobsSlice.actions;
export default jobsSlice.reducer;
