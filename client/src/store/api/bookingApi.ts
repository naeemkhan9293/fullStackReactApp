import { baseApi } from './baseApi'

export interface Booking {
  _id: string;
  service: {
    _id: string;
    name: string;
    category: string;
  } | string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  provider: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  serviceOption: string;
  price: number;
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'processing' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  service: string;
  serviceOption: string;
  price: number;
  date: string;
  timeSlot: string;
  address: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
}

export interface BookingsResponse {
  success: boolean;
  count: number;
  data: Booking[];
}

export interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<BookingsResponse, void>({
      query: () => '/bookings',
      providesTags: ['Booking'],
    }),
    getMyBookings: builder.query<BookingsResponse, void>({
      query: () => '/bookings/me',
      providesTags: ['Booking'],
    }),
    getBooking: builder.query<BookingResponse, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation<BookingResponse, CreateBookingRequest>({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingStatus: builder.mutation<BookingResponse, { id: string, status: UpdateBookingStatusRequest }>({
      query: ({ id, status }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: status,
      }),
      invalidatesTags: ['Booking'],
    }),
    deleteBooking: builder.mutation<{ success: boolean, data: {} }, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
})

export const {
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation
} = bookingApi
