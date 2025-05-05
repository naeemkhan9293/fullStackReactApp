import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserSubscriptionQuery } from '@/store/api/subscriptionApi';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // Fetch user's subscription to get updated details
  const { data: subscriptionData, refetch } = useGetUserSubscriptionQuery();

  // Refetch subscription data when component mounts
  useEffect(() => {
    if (sessionId) {
      refetch();
    }
  }, [sessionId, refetch]);

  const subscription = subscriptionData?.data;
  const subscriptionType = subscription?.subscriptionType || 'regular';
  const isTrialing = subscription?.subscriptionStatus === 'trialing';

  return (
    <div className="container max-w-2xl py-12 m-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing to our {subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {isTrialing 
              ? `Your free trial has started. You won't be charged until the trial period ends.`
              : `Your subscription is now active.`
            }
          </p>
          
          <div className="bg-primary/10 rounded-lg p-4 mx-auto max-w-md">
            <p className="font-medium">Your account has been credited with:</p>
            <p className="text-2xl font-bold mt-2">
              {subscriptionType === 'regular' ? '20' : '40'} credits
            </p>
          </div>
          
          <p className="text-muted-foreground">
            You can manage your subscription and view your credit history in your account settings.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/user/subscription')}>
            Manage Subscription
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
