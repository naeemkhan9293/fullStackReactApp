import { useState } from 'react';
import { toast } from 'sonner';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useConfirmWalletDepositMutation } from '@/store/api/walletApi';

interface AddMoneyFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}

const AddMoneyForm = ({ clientSecret, amount, onSuccess }: AddMoneyFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  
  const [confirmDeposit] = useConfirmWalletDepositMutation();

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
        // Confirm the deposit with the server
        await confirmDeposit({
          paymentIntentId: paymentIntent.id,
          amount,
        }).unwrap();
        
        toast.success('Payment successful!', {
          description: `$${amount.toFixed(2)} has been added to your wallet.`,
        });
        
        onSuccess();
      } else {
        toast.info('Payment is processing', {
          description: 'Your payment is being processed. We will update you when it completes.',
        });
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
          <span className="font-medium">Amount to Add:</span>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your payment is secure and encrypted. The funds will be available in your wallet immediately.
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

export default AddMoneyForm;
