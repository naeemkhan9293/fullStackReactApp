import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, CreditCard, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/store/store';
import { 
  useGetSubscriptionPlansQuery, 
  useCreateCheckoutSessionMutation, 
  useGetUserSubscriptionQuery 
} from '@/store/api/subscriptionApi';

const GetCreditsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requiredCredits = parseInt(searchParams.get('required') || '5');
  const returnUrl = searchParams.get('returnUrl') || '/marketplace';
  
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPlan, setSelectedPlan] = useState<'regular' | 'premium' | null>(null);

  // Fetch subscription plans
  const { data: plansData, isLoading: isLoadingPlans } = useGetSubscriptionPlansQuery();
  
  // Fetch user's current subscription
  const { data: userSubscription, isLoading: isLoadingSubscription } = useGetUserSubscriptionQuery();
  
  // Create checkout session mutation
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();

  // Handle subscription checkout
  const handleSubscribe = async (plan: 'regular' | 'premium') => {
    if (!user) {
      toast.error('You must be logged in to subscribe');
      navigate('/auth/login');
      return;
    }

    try {
      setSelectedPlan(plan);
      const response = await createCheckoutSession({ plan }).unwrap();
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription', {
        description: error.data?.error || 'An error occurred. Please try again.',
      });
      setSelectedPlan(null);
    }
  };

  // Loading state
  if (isLoadingPlans || isLoadingSubscription) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading subscription plans...</p>
      </div>
    );
  }

  // Get current user credits
  const currentCredits = userSubscription?.data.credits || 0;
  const hasEnoughCredits = currentCredits >= requiredCredits;
  
  // Get plan details
  const regularPlan = plansData?.data.regular;
  const premiumPlan = plansData?.data.premium;

  return (
    <div className="container max-w-5xl py-8 m-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Get Credits</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          You need at least {requiredCredits} credits to book a service. 
          You currently have {currentCredits} credits.
        </p>
      </div>

      {hasEnoughCredits ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">You Have Enough Credits!</h2>
          <p className="text-green-700 mb-4">
            You have {currentCredits} credits, which is enough to book your service.
          </p>
          <Button onClick={() => navigate(returnUrl)}>
            Continue to Booking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">You Need More Credits</h2>
          <p className="text-yellow-700 mb-4">
            You have {currentCredits} credits, but you need {requiredCredits} credits to book this service.
            Choose a subscription plan below to get more credits.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Regular Plan */}
        {regularPlan && (
          <Card className={`relative overflow-hidden ${selectedPlan === 'regular' ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{regularPlan.name}</span>
                <Badge variant="outline" className="ml-2">Monthly</Badge>
              </CardTitle>
              <CardDescription>Perfect for occasional users</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${regularPlan.price}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Start with a {regularPlan.trialDays}-day free trial. Cancel anytime.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{regularPlan.initialCredits} credits during trial</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{regularPlan.monthlyCredits} credits per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Access to all basic features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('regular')}
                disabled={isCreatingCheckout || selectedPlan !== null}
              >
                {isCreatingCheckout && selectedPlan === 'regular' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Get {regularPlan.initialCredits} Credits Now
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Premium Plan */}
        {premiumPlan && (
          <Card className={`relative overflow-hidden ${selectedPlan === 'premium' ? 'border-primary' : ''}`}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
              Best Value
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{premiumPlan.name}</span>
                <Badge variant="outline" className="ml-2">Yearly</Badge>
              </CardTitle>
              <CardDescription>Ideal for regular users</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${premiumPlan.price}</span>
                <span className="text-muted-foreground ml-1">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Start with a {premiumPlan.trialDays}-day free trial. Cancel anytime.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{premiumPlan.initialCredits} credits during trial</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{premiumPlan.monthlyCredits} credits per year</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Access to all premium features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('premium')}
                disabled={isCreatingCheckout || selectedPlan !== null}
              >
                {isCreatingCheckout && selectedPlan === 'premium' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get {premiumPlan.initialCredits} Credits Now
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate(returnUrl)}>
          Return to Previous Page
        </Button>
      </div>
    </div>
  );
};

export default GetCreditsPage;
