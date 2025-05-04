import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/store/store';
import { useGetSubscriptionPlansQuery, useCreateCheckoutSessionMutation, useGetUserSubscriptionQuery } from '@/store/api/subscriptionApi';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
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

  // Check if user already has an active subscription
  const hasActiveSubscription = userSubscription?.data.subscriptionStatus === 'active' || 
                               userSubscription?.data.subscriptionStatus === 'trialing';

  // Get plan details
  const regularPlan = plansData?.data.regular;
  const premiumPlan = plansData?.data.premium;

  return (
    <div className="container max-w-5xl py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choose Your Subscription Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the plan that works best for you. All plans include a free trial period with no commitment.
        </p>
      </div>

      {hasActiveSubscription && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-yellow-800">
            You already have an active {userSubscription?.data.subscriptionType} subscription. 
            You can manage your subscription in your account settings.
          </p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => navigate('/user/subscription')}
          >
            Manage Subscription
          </Button>
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
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-muted-foreground">Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('regular')}
                disabled={isCreatingCheckout || hasActiveSubscription || selectedPlan !== null}
              >
                {isCreatingCheckout && selectedPlan === 'regular' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {hasActiveSubscription ? 'Already Subscribed' : 'Start Free Trial'}
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
                disabled={isCreatingCheckout || hasActiveSubscription || selectedPlan !== null}
              >
                {isCreatingCheckout && selectedPlan === 'premium' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {hasActiveSubscription ? 'Already Subscribed' : 'Start Free Trial'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          <div>
            <h3 className="font-medium">What happens after my free trial?</h3>
            <p className="text-muted-foreground">After your trial period ends, you'll be automatically charged for your selected plan. You can cancel anytime before the trial ends.</p>
          </div>
          <div>
            <h3 className="font-medium">Can I change my plan later?</h3>
            <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
          </div>
          <div>
            <h3 className="font-medium">How do credits work?</h3>
            <p className="text-muted-foreground">Credits are used to book services on our platform. Each service booking requires a certain number of credits.</p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">We accept all major credit cards through our secure payment processor, Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
