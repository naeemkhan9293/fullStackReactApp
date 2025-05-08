import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetUserSubscriptionQuery, useGetAllUserSubscriptionsQuery, useGetCreditHistoryQuery } from '@/store/api/subscriptionApi';

// Subscription plan details - should match server-side values
const SUBSCRIPTION_PLANS = {
  regular: {
    initialCredits: 10,
    monthlyCredits: 100,
  },
  premium: {
    initialCredits: 20,
    monthlyCredits: 200,
  },
};

// Credit package details - should match server-side values
const CREDIT_PACKAGES = {
  small: {
    credits: 20,
    price: 5.99,
  },
  medium: {
    credits: 50,
    price: 12.99,
  },
  large: {
    credits: 100,
    price: 19.99,
  },
};

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const subscriptionRef = searchParams.get('ref');
  const purchaseType = searchParams.get('type'); // 'credits' for credit purchase
  const creditPackage = searchParams.get('package'); // small, medium, large
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is a credit purchase or subscription
  const isCreditPurchase = purchaseType === 'credits';

  // Fetch user's subscription to get updated details
  const { data: subscriptionData, isLoading: isLoadingSubscription, refetch: refetchSubscription } = useGetUserSubscriptionQuery();

  // Fetch all user subscriptions to find the newly created one
  const { data: allSubscriptionsData, isLoading: isLoadingAllSubscriptions, refetch: refetchAllSubscriptions } = useGetAllUserSubscriptionsQuery();

  // Fetch credit history to find the newly added credits
  const { data: creditHistoryData, isLoading: isLoadingCreditHistory, refetch: refetchCreditHistory } = useGetCreditHistoryQuery();

  // Refetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // For credit purchases, we check for the package parameter
        // For subscriptions, we check for the sessionId
        if ((isCreditPurchase && creditPackage) || sessionId) {
          // Determine which data to fetch based on purchase type
          if (isCreditPurchase) {
            // For credit purchases, we only need user subscription and credit history
            await Promise.all([
              refetchSubscription(),
              refetchCreditHistory()
            ]);
          } else {
            // For subscriptions, fetch all data
            await Promise.all([
              refetchSubscription(),
              refetchAllSubscriptions(),
              refetchCreditHistory()
            ]);
          }

          // Give the server a moment to process the webhook if needed
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        } else {
          // If we don't have the required parameters, show an error
          setError('Missing transaction information. Please check your account dashboard.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load transaction details. Please check your account dashboard.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId, isCreditPurchase, creditPackage, refetchSubscription, refetchAllSubscriptions, refetchCreditHistory]);

  // Find the active subscription
  const activeSubscription = subscriptionData?.data;

  // Find the newly created subscription by reference (if available)
  const newSubscription = subscriptionRef && allSubscriptionsData?.data
    ? allSubscriptionsData.data.find(sub =>
        sub.stripeSubscriptionId.includes(subscriptionRef.split('_').pop() || '')
      )
    : null;

  // Use the new subscription if found, otherwise fall back to the active one
  const subscription = newSubscription || activeSubscription;

  // Get subscription details
  const subscriptionType = subscription?.subscriptionType || 'regular';
  // Handle different subscription object structures
  const isTrialing =
    (subscription && 'status' in subscription && subscription.status === 'trialing') ||
    activeSubscription?.subscriptionStatus === 'trialing';

  // Find the most recent credit transaction (for credit purchases)
  const latestCreditTransaction = creditHistoryData?.data[0];

  // Get the correct credit amount based on the transaction type
  let creditsAdded = 0;

  if (isCreditPurchase && creditPackage) {
    // For credit purchases, get the amount from the package
    creditsAdded = CREDIT_PACKAGES[creditPackage as keyof typeof CREDIT_PACKAGES]?.credits || 0;
  } else {
    // For subscriptions, get the amount from the subscription plan
    creditsAdded = SUBSCRIPTION_PLANS[subscriptionType as keyof typeof SUBSCRIPTION_PLANS]?.initialCredits || 0;
  }

  // If we have credit history, try to get the exact amount from the latest transaction
  if (latestCreditTransaction && sessionId) {
    // Check if this transaction is related to the current session
    if (latestCreditTransaction.reference?.includes(sessionId.substring(0, 10))) {
      creditsAdded = latestCreditTransaction.amount;
    }
  }

  // Show loading state
  if (isLoading || isLoadingSubscription || isLoadingAllSubscriptions || isLoadingCreditHistory) {
    return (
      <div className="container max-w-2xl py-12 m-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isCreditPurchase ? 'Processing Your Credit Purchase' : 'Processing Your Subscription'}
            </CardTitle>
            <CardDescription>
              Please wait while we finalize your transaction details...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <p>This may take a few moments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container max-w-2xl py-12 m-auto">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isCreditPurchase ? 'Credit Purchase Processing' : 'Subscription Processing'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="mb-4">
              Your transaction may still be processing. You can check your account dashboard for the latest status.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/user/subscription')}>
              Go to Account Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12 m-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            {isCreditPurchase ? (
              <CreditCard className="h-8 w-8 text-green-600" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isCreditPurchase ? 'Credit Purchase Successful!' : 'Subscription Successful!'}
          </CardTitle>
          <CardDescription>
            {isCreditPurchase
              ? `Thank you for purchasing the ${creditPackage ? creditPackage.charAt(0).toUpperCase() + creditPackage.slice(1) : 'credit'} package`
              : `Thank you for subscribing to our ${subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)} plan`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCreditPurchase && (
            <p>
              {isTrialing
                ? `Your free trial has started. You won't be charged until the trial period ends.`
                : `Your subscription is now active.`
              }
            </p>
          )}

          <div className="bg-primary/10 rounded-lg p-4 mx-auto max-w-md">
            <p className="font-medium">Your account has been credited with:</p>
            <p className="text-2xl font-bold mt-2">
              {creditsAdded} credits
            </p>
          </div>

          <p className="text-muted-foreground">
            {isCreditPurchase
              ? 'You can view your credit history in your account settings.'
              : 'You can manage your subscription and view your credit history in your account settings.'
            }
          </p>

          {!isCreditPurchase && newSubscription && activeSubscription &&
           newSubscription.id !== (activeSubscription.stripeSubscription?.id) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 font-medium mb-2">
                You now have multiple subscriptions!
              </p>
              <p className="text-blue-700 text-sm mb-2">
                You can manage all your subscriptions and choose which one to activate from your account dashboard.
              </p>
            </div>
          )}

          {!isCreditPurchase && !newSubscription && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 font-medium mb-2">
                Don't see your new subscription?
              </p>
              <p className="text-yellow-700 text-sm mb-2">
                It may take a moment for your subscription to appear. You can go to your account dashboard and use the "Sync with Stripe" button to manually sync your subscriptions.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(isCreditPurchase ? '/user/credits' : '/user/subscription')}
          >
            {isCreditPurchase ? 'View Credit History' : 'Manage Subscription'}
          </Button>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Services
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
