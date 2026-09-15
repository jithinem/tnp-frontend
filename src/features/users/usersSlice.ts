import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { Paginated, User } from '../../types';

interface UsersState {
  list: User[];
  loading: boolean;
  submitting: boolean;
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  loading: false,
  submitting: false,
  pagination: null,
  error: null,
};

export const fetchUsers = createAsyncThunk<Paginated<User>, Record<string, string | number | boolean | undefined> | undefined, { rejectValue: string }>(
  'users/fetchUsers',
  async (filters = {}, thunkApi) => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.role) params.set('role', String(filters.role));
      if (filters?.search) params.set('search', String(filters.search));
      if (filters?.is_active !== undefined && filters?.is_active !== '') params.set('is_active', String(filters.is_active));

      const { data } = await api.get(`/users?${params.toString()}`);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Users fetch failed');
      }
      return data.data as Paginated<User>;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Users fetch failed'));
    }
  }
);

export const createUser = createAsyncThunk<User, Partial<User>, { rejectValue: string }>(
  'users/createUser',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post('/users', payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'User create failed');
      }
      return data.data as User;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'User create failed'));
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: number; payload: Partial<User> }, { rejectValue: string }>(
  'users/updateUser',
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.put(`/users/${id}`, payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'User update failed');
      }
      return data.data as User;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'User update failed'));
    }
  }
);

export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/deleteUser',
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/users/${id}`);
      if (!data?.success) {
        return thunkApi.rejectWithValue(data?.message || 'User delete failed');
      }
      return id;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'User delete failed'));
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.rows || action.payload.data || action.payload.items || [];
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch users';
      })
      .addCase(createUser.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'User create failed';
      })
      .addCase(updateUser.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'User update failed';
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'User delete failed';
      });
  },
});

export default usersSlice.reducer;
