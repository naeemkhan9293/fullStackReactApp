import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/config/axios';
import { RootState } from '../store';

// Define the upload state interface
interface UploadState {
  avatar: string | null;
  serviceImage: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UploadState = {
  avatar: null,
  serviceImage: null,
  isLoading: false,
  error: null,
};

// Create async thunk for avatar upload
export const uploadAvatar = createAsyncThunk(
  'upload/avatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Use axios instance with FormData
      // Don't set Content-Type header, let axios set it with the boundary
      const response = await axiosInstance.post(
        '/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': undefined
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ error: error.message });
    }
  }
);

// Create async thunk for service image upload
export const uploadServiceImage = createAsyncThunk(
  'upload/serviceImage',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use axios instance with FormData
      const response = await axiosInstance.post(
        '/upload/service',
        formData,
        {
          headers: {
            'Content-Type': undefined
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ error: error.message });
    }
  }
);

// Create the upload slice
const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearUploadState: (state) => {
      state.avatar = null;
      state.serviceImage = null;
      state.isLoading = false;
      state.error = null;
    },
    clearServiceImage: (state) => {
      state.serviceImage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Avatar upload cases
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.avatar = action.payload.data.avatar;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?
          (action.payload as any).error || 'Upload failed' :
          action.error.message || 'Upload failed';
      })
      // Service image upload cases
      .addCase(uploadServiceImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadServiceImage.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.serviceImage = action.payload.data.imageUrl;
      })
      .addCase(uploadServiceImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?
          (action.payload as any).error || 'Image upload failed' :
          action.error.message || 'Image upload failed';
      });
  },
});

// Export actions and reducer
export const { clearUploadState, clearServiceImage } = uploadSlice.actions;
export const selectUploadState = (state: RootState) => state.upload;
export default uploadSlice.reducer;
