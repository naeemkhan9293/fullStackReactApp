import { baseApi } from "./baseApi";

// Define interfaces for request and response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "provider";
}

export interface AuthResponse {
  success: boolean;
  token: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "customer" | "provider" | "admin";
    avatar?: string;
    phone?: string;
    address?: string;
    bio?: string;
    location?: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  address?: string;
  location?: string;
  website?: string;
}

// No need for a specific interface for FormData
// The file will be sent as multipart/form-data

export interface UploadAvatarResponse {
  success: boolean;
  data: {
    avatar: string;
    user: UserResponse["data"];
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    logout: builder.mutation<{ success: boolean; data: {} }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),
    getCurrentUser: builder.query<UserResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<UserResponse, UpdateProfileRequest>({
      query: (userData) => ({
        url: "/auth/updatedetails",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builder.mutation<UploadAvatarResponse, FormData>({
      query: (formData) => {
        return {
          url: "/upload/avatar",
          method: "POST",
          body: formData,
          // headers: {
          //   "Content-Type": "multipart/form-data;",
          // },
          // formData: true,
        };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = authApi;
