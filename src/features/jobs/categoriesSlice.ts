import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { Category, CategoryPayload, Paginated } from '../../types';

interface CategoriesState {
  list: Category[];
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  current: Category | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  list: [],
  pagination: null,
  current: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchCategories',
  async (_payload, thunkApi) => {
    try {
      const { data } = await api.get('/categories/all');
      if (!data?.success || !data?.data) {
        return thunkApi.rejectWithValue(data?.message || 'Categories fetch failed');
      }
      return data.data as Category[];
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Categories fetch failed'));
    }
  }
);

export const fetchCategoriesPage = createAsyncThunk<Paginated<Category>, { page?: number; limit?: number } | undefined, { rejectValue: string }>(
  'categories/fetchCategoriesPage',
  async (filters = {}, thunkApi) => {
    try {
      const { data } = await api.get('/categories', { params: filters });
      if (!data?.success || !data?.data) return thunkApi.rejectWithValue(data?.message || 'Categories fetch failed');
      return data.data as Paginated<Category>;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Categories fetch failed'));
    }
  },
);

export const fetchCategoryById = createAsyncThunk<Category, number, { rejectValue: string }>(
  'categories/fetchCategoryById',
  async (id, thunkApi) => {
    try {
      const { data } = await api.get(`/categories/${id}`);
      if (!data?.success || !data?.data) return thunkApi.rejectWithValue(data?.message || 'Category fetch failed');
      return data.data as Category;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Category fetch failed'));
    }
  },
);

export const createCategory = createAsyncThunk<Category, CategoryPayload, { rejectValue: string }>(
  'categories/createCategory',
  async (payload, thunkApi) => {
    try {
      const { data } = await api.post('/categories', payload);
      if (!data?.success || !data?.data) return thunkApi.rejectWithValue(data?.message || 'Category create failed');
      return data.data as Category;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Category create failed'));
    }
  },
);

export const updateCategory = createAsyncThunk<Category, { id: number; payload: CategoryPayload }, { rejectValue: string }>(
  'categories/updateCategory',
  async ({ id, payload }, thunkApi) => {
    try {
      const { data } = await api.put(`/categories/${id}`, payload);
      if (!data?.success || !data?.data) return thunkApi.rejectWithValue(data?.message || 'Category update failed');
      return data.data as Category;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Category update failed'));
    }
  },
);

export const deleteCategory = createAsyncThunk<number, number, { rejectValue: string }>(
  'categories/deleteCategory',
  async (id, thunkApi) => {
    try {
      const { data } = await api.delete(`/categories/${id}`);
      if (!data?.success) return thunkApi.rejectWithValue(data?.message || 'Category delete failed');
      return id;
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getApiErrorMessage(error, 'Category delete failed'));
    }
  },
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch categories';
      })
      .addCase(fetchCategoriesPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesPage.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.pagination = { page: action.payload.page, limit: action.payload.limit, total: action.payload.total, pages: action.payload.pages };
      })
      .addCase(fetchCategoriesPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch categories';
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createCategory.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(updateCategory.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(deleteCategory.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(createCategory.fulfilled, (state, action) => { state.submitting = false; state.list.unshift(action.payload); })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.submitting = false;
        state.current = action.payload;
        state.list = state.list.map((category) => category.id === action.payload.id ? action.payload : category);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => { state.submitting = false; state.list = state.list.filter((category) => category.id !== action.payload); })
      .addCase(createCategory.rejected, (state, action) => { state.submitting = false; state.error = action.payload || 'Category create failed'; })
      .addCase(updateCategory.rejected, (state, action) => { state.submitting = false; state.error = action.payload || 'Category update failed'; })
      .addCase(deleteCategory.rejected, (state, action) => { state.submitting = false; state.error = action.payload || 'Category delete failed'; })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.error = action.payload || 'Category fetch failed';
      });
  },
});

export default categoriesSlice.reducer;
