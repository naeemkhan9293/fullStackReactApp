import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  bookingId: string;
  paymentId: string;
  amount: number;
}

const PaymentForm = ({ clientSecret, bookingId, amount }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setCardError(error.message || 'An error occurred while processing your payment.');
        toast.error('Payment failed', {
          description: error.message || 'An error occurred while processing your payment.',
        });
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!', {
          description: 'Your booking has been paid for.',
        });
        navigate(`/user/my-bookings/${bookingId}`);
      } else {
        toast.info('Payment is processing', {
          description: 'Your payment is being processed. We will update you when it completes.',
        });
        navigate(`/user/my-bookings/${bookingId}`);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setCardError('An unexpected error occurred. Please try again.');
      toast.error('Payment error', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md">
        <label className="block text-sm font-medium mb-2">
          Card Details
        </label>
        <CardElement options={cardElementOptions} className="p-3 border rounded" />
        {cardError && (
          <p className="mt-2 text-sm text-red-600">{cardError}</p>
        )}
      </div>

      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your payment is secure and encrypted. You will not be charged until the service is completed.
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export default PaymentForm;
