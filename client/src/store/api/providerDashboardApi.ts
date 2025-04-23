import { baseApi } from './baseApi';

// Provider dashboard stats response type
export interface ProviderDashboardStatsResponse {
  success: boolean;
  data: {
    servicesOffered: number;
    activeBookings: number;
    pendingRequests: number;
    totalEarnings: number;
  };
}

// Provider recent activity response type
export interface RecentActivityItem {
  id: string;
  type: 'booking' | 'completed' | 'request' | 'review';
  service: string;
  amount?: number;
  rating?: number;
  date: string;
}

export interface ProviderRecentActivityResponse {
  success: boolean;
  count: number;
  data: RecentActivityItem[];
}

// Provider popular services response type
export interface PopularServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
}

export interface ProviderPopularServicesResponse {
  success: boolean;
  count: number;
  data: PopularServiceItem[];
}

export const providerDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProviderDashboardStats: builder.query<ProviderDashboardStatsResponse, void>({
      query: () => '/dashboard/provider/stats',
      providesTags: ['Service', 'Booking'],
    }),
    getProviderRecentActivity: builder.query<ProviderRecentActivityResponse, void>({
      query: () => '/dashboard/provider/recent-activity',
      providesTags: ['Service', 'Booking', 'Review'],
    }),
    getProviderPopularServices: builder.query<ProviderPopularServicesResponse, void>({
      query: () => '/dashboard/provider/popular-services',
      providesTags: ['Service'],
    }),
  }),
});

export const {
  useGetProviderDashboardStatsQuery,
  useGetProviderRecentActivityQuery,
  useGetProviderPopularServicesQuery,
} = providerDashboardApi;
