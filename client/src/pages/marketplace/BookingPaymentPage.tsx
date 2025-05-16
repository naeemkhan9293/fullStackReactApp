import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useGetBookingQuery } from '@/store/api/bookingApi';
import { useCreatePaymentIntentMutation } from '@/store/api/paymentApi';
import PaymentForm from '@/components/payment/PaymentForm';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingPaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Get booking details
  const { data: bookingData, isLoading: isLoadingBooking, error: bookingError } = useGetBookingQuery(id || '');

  // Create payment intent mutation
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  useEffect(() => {
    // If booking is loaded and payment status is unpaid, create a payment intent
    if (bookingData?.data && bookingData.data.paymentStatus === 'unpaid' && id) {
      const createIntent = async () => {
        try {
          const response = await createPaymentIntent({ bookingId: id }).unwrap();
          setClientSecret(response.data.clientSecret);
          setPaymentId(response.data.paymentId);
        } catch (error: any) {
          toast.error('Failed to create payment', {
            description: error.data?.error || 'An error occurred. Please try again.',
          });
        }
      };

      createIntent();
    } else if (bookingData?.data && bookingData.data.paymentStatus !== 'unpaid') {
      // If payment status is not unpaid, redirect to booking details
      toast.info('Payment already processed', {
        description: 'This booking has already been paid for.',
      });
      navigate(`/user/my-bookings/${id}`);
    }
  }, [bookingData, id, createPaymentIntent, navigate]);

  // Handle loading state
  if (isLoadingBooking || !bookingData) {
    return (
      <div className="container max-w-4xl py-8 m-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading Booking Details</CardTitle>
            <CardDescription>Please wait while we load your booking information...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (bookingError) {
    return (
      <div className="container max-w-4xl py-8 m-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Error Loading Booking</CardTitle>
            <CardDescription>We couldn't load your booking details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">
              {(bookingError as any)?.data?.error || 'An error occurred. Please try again.'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/user/my-bookings')}>
              Return to My Bookings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const booking = bookingData.data;
  const serviceName = typeof booking.service === 'object' ? booking.service.name : 'Service';

  return (
    <div className="container max-w-4xl py-8 m-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>
            Pay for your booking of {serviceName} - {booking.serviceOption}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-lg mb-2">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-muted-foreground">Service:</p>
              <p className="font-medium">{serviceName}</p>

              <p className="text-muted-foreground">Option:</p>
              <p className="font-medium">{booking.serviceOption}</p>

              <p className="text-muted-foreground">Date:</p>
              <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>

              <p className="text-muted-foreground">Time:</p>
              <p className="font-medium">{booking.timeSlot}</p>

              <p className="text-muted-foreground">Total Amount:</p>
              <p className="font-medium text-lg">${booking.price.toFixed(2)}</p>
            </div>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                bookingId={id || ''}
                paymentId={paymentId || ''}
                amount={booking.price}
              />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/user/my-bookings')}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingPaymentPage;
