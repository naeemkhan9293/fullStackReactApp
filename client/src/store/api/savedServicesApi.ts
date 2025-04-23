import { baseApi } from './baseApi';

export interface SavedService {
  _id: string;
  serviceId: string;
  name: string;
  providerName: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  image: string | null;
}

export const savedServicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSavedServices: builder.query<{ success: boolean; count: number; data: SavedService[] }, void>({
      query: () => '/saved-services',
      providesTags: ['Service'],
    }),
    saveService: builder.mutation<{ success: boolean; data: any }, string>({
      query: (serviceId) => ({
        url: `/saved-services/${serviceId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Service'],
    }),
    removeSavedService: builder.mutation<{ success: boolean; data: any }, string>({
      query: (serviceId) => ({
        url: `/saved-services/${serviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useGetSavedServicesQuery,
  useSaveServiceMutation,
  useRemoveSavedServiceMutation,
} = savedServicesApi;
