import { baseApi } from './baseApi';

export interface Payment {
  _id: string;
  booking: string;
  customer: string;
  provider: string;
  amount: number;
  stripePaymentIntentId: string;
  status: 'pending' | 'processing' | 'held' | 'released' | 'refunded' | 'failed';
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentId: string;
  };
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<PaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (data) => ({
        url: '/payments/create-intent',
        method: 'POST',
        body: data,
      }),
    }),
    releasePayment: builder.mutation<PaymentResponse, { bookingId: string }>({
      query: (data) => ({
        url: '/payments/release',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useReleasePaymentMutation,
} = paymentApi;
