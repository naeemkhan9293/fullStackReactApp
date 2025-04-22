import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { authApi } from '../api/authApi';

export interface User {
  _id: string;
  id?: string; // Adding id as an alias for _id for compatibility
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string }>
    ) => {
      const { token } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    setUser: (state, action: PayloadAction<User>) => {
      // Create a new object with id set as an alias for _id for compatibility
      if (action.payload) {
        state.user = {
          ...action.payload,
          id: action.payload._id
        };
      } else {
        state.user = null;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login success
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.token;
          state.isAuthenticated = true;
          localStorage.setItem('token', payload.token);
        }
      )
      // Handle register success
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.token;
          state.isAuthenticated = true;
          localStorage.setItem('token', payload.token);
        }
      )
      // Handle logout success
      .addMatcher(
        authApi.endpoints.logout.matchFulfilled,
        (state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
        }
      )
      // Handle get current user success
      .addMatcher(
        authApi.endpoints.getCurrentUser.matchFulfilled,
        (state, { payload }) => {
          if (payload.data && payload.data._id) {
            // Create a new object instead of modifying the existing one
            state.user = {
              ...payload.data,
              id: payload.data._id
            };
          } else {
            state.user = payload.data;
          }
          state.isLoading = false;
        }
      )
      // Handle get current user loading
      .addMatcher(
        authApi.endpoints.getCurrentUser.matchPending,
        (state) => {
          state.isLoading = true;
        }
      )
      // Handle get current user error
      .addMatcher(
        authApi.endpoints.getCurrentUser.matchRejected,
        (state, { error }) => {
          state.isLoading = false;
          console.error('getCurrentUser error:', error);
          // Don't clear auth state on getCurrentUser failure to prevent immediate logout
          // This allows us to debug the issue
          // state.user = null;
          // state.token = null;
          // state.isAuthenticated = false;
          // localStorage.removeItem('token');
        }
      );
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;
