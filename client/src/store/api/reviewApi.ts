import { baseApi } from './baseApi'

export interface Review {
  _id: string;
  service: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  service: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
}

export interface ReviewsResponse {
  success: boolean;
  count: number;
  data: Review[];
}

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewsResponse, string | void>({
      query: (serviceId) => serviceId ? `/reviews?service=${serviceId}` : '/reviews',
      providesTags: ['Review'],
    }),
    getReview: builder.query<ReviewResponse, string>({
      query: (id) => `/reviews/${id}`,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation<ReviewResponse, ReviewRequest>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Service'],
    }),
    updateReview: builder.mutation<ReviewResponse, { id: string, reviewData: Partial<ReviewRequest> }>({
      query: ({ id, reviewData }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Service'],
    }),
    deleteReview: builder.mutation<{ success: boolean, data: {} }, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Service'],
    }),
  }),
})

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation
} = reviewApi
