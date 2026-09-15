import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { AuthSession, AuthUser, UploadResponse } from '../../types';

interface AuthState {
  loading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  error: string | null;
}

const storedUser = (() => {
  try {
    const payload = localStorage.getItem('user');
    return payload ? (JSON.parse(payload) as AuthUser) : null;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  loading: false,
  user: storedUser,
  accessToken: localStorage.getItem('accessToken') || null,
  error: null,
};

const saveLoginSession = (session: AuthSession) => {
  localStorage.setItem('accessToken', session.accessToken);
  localStorage.setItem('user', JSON.stringify(session.user));
  setAuthToken(session.accessToken);
};

export const loginUser = createAsyncThunk<AuthSession, { email: string; password: string }, { rejectValue: string }>(
  'auth/loginUser',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Login failed');
      }
      const session = {
        user: data.data.user,
        accessToken: data.data.accessToken,
      } as AuthSession;
      saveLoginSession(session);
      return session;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Login failed'));
    }
  }
);

export const loginAdmin = createAsyncThunk<AuthSession, { email: string; password: string }, { rejectValue: string }>(
  'auth/loginAdmin',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Admin login failed');
      }
      const session = {
        user: data.data.user,
        accessToken: data.data.accessToken,
      } as AuthSession;
      saveLoginSession(session);
      return session;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Admin login failed'));
    }
  }
);

export const loadCurrentUser = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/loadCurrentUser',
  async (_payload, thunkApi) => {
    try {
      const { data } = await api.get('/auth/me');
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Unable to load current user');
      }
      return data.data as AuthUser;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Unable to load current user'));
    }
  }
);

export const updateMyProfile = createAsyncThunk<AuthUser, Partial<AuthUser>, { rejectValue: string }>(
  'auth/updateMyProfile',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.put('/auth/me', payload);
      if (!data?.success || !data?.data) return thunkApi.rejectWithValue(data?.message || 'Unable to update profile');
      return data.data as AuthUser;
    } catch (error: unknown) { return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Unable to update profile')); }
  },
);

export const uploadProfilePhoto = createAsyncThunk<UploadResponse, File, { rejectValue: string }>(
  'auth/uploadProfilePhoto',
  async (file, thunkApi) => {
    try {
      const formData = new FormData(); formData.append('file', file);
      const { data } = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!data?.success || !data?.data?.url) return thunkApi.rejectWithValue(data?.message || 'Photo upload failed');
      return data.data as UploadResponse;
    } catch (error: unknown) { return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Photo upload failed')); }
  },
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_payload, thunkApi) => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore server errors but clear client caches
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAuthToken(undefined);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setAuthSession(state, action: PayloadAction<{ accessToken: string; user?: AuthUser }>) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.error = null;
    },
    logout(state) {
      state.loading = false;
      state.user = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAuthToken(undefined);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Admin login failed';
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load current user';
      })
      .addCase(updateMyProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateMyProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; localStorage.setItem('user', JSON.stringify(action.payload)); })
      .addCase(updateMyProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Unable to update profile'; })
      .addCase(uploadProfilePhoto.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadProfilePhoto.fulfilled, (state) => { state.loading = false; })
      .addCase(uploadProfilePhoto.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Photo upload failed'; })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
      });
  },
});

export const { clearAuthError, setAuthSession, logout } = authSlice.actions;
export default authSlice.reducer;
