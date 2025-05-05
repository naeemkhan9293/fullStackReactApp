import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, CreditCard, Sparkles, ArrowRight, Check, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/store/store';
import {
  useGetSubscriptionPlansQuery,
  useCreateCheckoutSessionMutation,
  useGetUserSubscriptionQuery,
  usePurchaseCreditsMutation
} from '@/store/api/subscriptionApi';

const GetCreditsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requiredCredits = parseInt(searchParams.get('required') || '5');
  const returnUrl = searchParams.get('returnUrl') || '/marketplace';

  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedPlan, setSelectedPlan] = useState<'regular' | 'premium' | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'small' | 'medium' | 'large' | null>(null);
  // Default tab is 'credits'

  // Fetch subscription plans
  const { data: plansData, isLoading: isLoadingPlans } = useGetSubscriptionPlansQuery();

  // Fetch user's current subscription
  const { data: userSubscription, isLoading: isLoadingSubscription } = useGetUserSubscriptionQuery();

  // Create checkout session mutation
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();

  // Purchase credits mutation
  const [purchaseCredits, { isLoading: isPurchasingCredits }] = usePurchaseCreditsMutation();

  // Credit packages
  const CREDIT_PACKAGES = {
    small: {
      name: 'Small Credit Package',
      credits: 20,
      price: 5.99,
    },
    medium: {
      name: 'Medium Credit Package',
      credits: 50,
      price: 12.99,
    },
    large: {
      name: 'Large Credit Package',
      credits: 100,
      price: 19.99,
    },
  };

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

  // Handle credit package purchase
  const handlePurchaseCredits = async (creditPackage: 'small' | 'medium' | 'large') => {
    if (!user) {
      toast.error('You must be logged in to purchase credits');
      navigate('/auth/login');
      return;
    }

    try {
      setSelectedPackage(creditPackage);
      const response = await purchaseCredits({ package: creditPackage }).unwrap();

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Credit purchase error:', error);
      toast.error('Failed to purchase credits', {
        description: error.data?.error || 'An error occurred. Please try again.',
      });
      setSelectedPackage(null);
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
            Choose a credit package or subscription plan below to get more credits.
          </p>
        </div>
      )}

      <Tabs defaultValue="credits" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits">Credit Packages</TabsTrigger>
          <TabsTrigger value="subscription">Subscription Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Small Package */}
            <Card className={`${selectedPackage === 'small' ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>Small Package</CardTitle>
                <CardDescription>Quick boost of credits</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${CREDIT_PACKAGES.small.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold">{CREDIT_PACKAGES.small.credits}</span>
                  <span className="text-muted-foreground ml-2">Credits</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePurchaseCredits('small')}
                  disabled={isPurchasingCredits || selectedPackage !== null}
                >
                  {isPurchasingCredits && selectedPackage === 'small' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Buy Now
                </Button>
              </CardFooter>
            </Card>

            {/* Medium Package */}
            <Card className={`${selectedPackage === 'medium' ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>Medium Package</CardTitle>
                <CardDescription>Most popular option</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${CREDIT_PACKAGES.medium.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold">{CREDIT_PACKAGES.medium.credits}</span>
                  <span className="text-muted-foreground ml-2">Credits</span>
                </div>
                <div className="text-center text-sm text-green-600">
                  Best value!
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePurchaseCredits('medium')}
                  disabled={isPurchasingCredits || selectedPackage !== null}
                >
                  {isPurchasingCredits && selectedPackage === 'medium' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Buy Now
                </Button>
              </CardFooter>
            </Card>

            {/* Large Package */}
            <Card className={`${selectedPackage === 'large' ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>Large Package</CardTitle>
                <CardDescription>Maximum credits</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${CREDIT_PACKAGES.large.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold">{CREDIT_PACKAGES.large.credits}</span>
                  <span className="text-muted-foreground ml-2">Credits</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePurchaseCredits('large')}
                  disabled={isPurchasingCredits || selectedPackage !== null}
                >
                  {isPurchasingCredits && selectedPackage === 'large' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
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
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate(returnUrl)}>
          Return to Previous Page
        </Button>
      </div>
    </div>
  );
};

export default GetCreditsPage;
