import { baseApi } from './baseApi';

export interface DashboardStats {
  activeBookings: number;
  upcomingServices: number;
  completedServices: number;
  savedServices: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export interface UpcomingService {
  _id: string;
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

export interface UpcomingServicesResponse {
  success: boolean;
  count: number;
  data: UpcomingService[];
}

export interface RecentBooking {
  _id: string;
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  createdAt: string;
}

export interface RecentBookingsResponse {
  success: boolean;
  count: number;
  data: RecentBooking[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Booking'],
    }),
    getUpcomingServices: builder.query<UpcomingServicesResponse, void>({
      query: () => '/dashboard/upcoming-services',
      providesTags: ['Booking'],
    }),
    getRecentBookings: builder.query<RecentBookingsResponse, void>({
      query: () => '/dashboard/recent-bookings',
      providesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetUpcomingServicesQuery,
  useGetRecentBookingsQuery,
} = dashboardApi;
