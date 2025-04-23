import { baseApi } from './baseApi'

// Define interfaces for request and response types
export interface ServiceRequest {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  options: {
    name: string;
    description: string;
    price: number;
  }[];
}

export interface Service {
  _id: string;
  name: string;
  provider: string | {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    bio?: string;
    createdAt?: string;
    serviceCount?: number;
    rating?: number;
  };
  category: string;
  description: string;
  basePrice: number;
  options: {
    name: string;
    description: string;
    price: number;
    _id: string;
  }[];
  availableTimeSlots?: string[];
  images?: string[];
  icon?: string;
  rating: number;
  reviewCount: number;
  status?: 'active' | 'draft' | 'paused';
  views?: number;
  bookings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  success: boolean;
  data: Service;
}

export interface ServicesResponse {
  success: boolean;
  count: number;
  data: Service[];
}

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServicesResponse, void>({
      query: () => '/services',
      providesTags: ['Service'],
    }),
    getServiceById: builder.query<ServiceResponse, string>({
      query: (id) => `/services/${id}`,
      providesTags: ['Service'],
    }),
    getUserServices: builder.query<ServicesResponse, void>({
      query: () => '/services/me',
      providesTags: ['Service'],
    }),
    createService: builder.mutation<ServiceResponse, ServiceRequest>({
      query: (serviceData) => ({
        url: '/services',
        method: 'POST',
        body: serviceData,
      }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation<ServiceResponse, { id: string, serviceData: ServiceRequest }>({
      query: ({ id, serviceData }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: serviceData,
      }),
      invalidatesTags: ['Service'],
    }),
    updateServiceStatus: builder.mutation<ServiceResponse, { id: string, status: 'active' | 'draft' | 'paused' }>({
      query: ({ id, status }) => ({
        url: `/services/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Service'],
    }),
  }),
})

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useGetUserServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceStatusMutation
} = serviceApi