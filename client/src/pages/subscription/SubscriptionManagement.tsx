import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CreditCard, Calendar, AlertTriangle, ArrowRight, Clock, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useGetUserSubscriptionQuery, 
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetCreditHistoryQuery
} from '@/store/api/subscriptionApi';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // Fetch user's subscription
  const { data: subscriptionData, isLoading: isLoadingSubscription, refetch } = useGetUserSubscriptionQuery();
  
  // Fetch credit history
  const { data: creditHistoryData, isLoading: isLoadingHistory } = useGetCreditHistoryQuery();
  
  // Cancel subscription mutation
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  
  // Resume subscription mutation
  const [resumeSubscription, { isLoading: isResuming }] = useResumeSubscriptionMutation();

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription().unwrap();
      toast.success('Subscription canceled successfully', {
        description: 'Your subscription will remain active until the end of the current billing period.',
      });
      setCancelDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel subscription', {
        description: error.data?.error || 'An error occurred. Please try again.',
      });
    }
  };

  // Handle subscription resumption
  const handleResumeSubscription = async () => {
    try {
      await resumeSubscription().unwrap();
      toast.success('Subscription resumed successfully');
      refetch();
    } catch (error: any) {
      console.error('Resume error:', error);
      toast.error('Failed to resume subscription', {
        description: error.data?.error || 'An error occurred. Please try again.',
      });
    }
  };

  // Loading state
  if (isLoadingSubscription) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading subscription details...</p>
      </div>
    );
  }

  const subscription = subscriptionData?.data;
  
  // Check if user has no subscription
  if (!subscription || subscription.subscriptionType === 'none') {
    return (
      <div className="container max-w-3xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">You don't have an active subscription.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Subscribe to get access to premium features and credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You currently have {subscription?.credits || 0} credits available.</p>
            <p className="mt-4">Subscribe to a plan to get more credits and access to premium features.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/subscription/plans')}>
              View Subscription Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get subscription status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-500">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if subscription is scheduled to be canceled
  const isCanceledAtPeriodEnd = subscription.stripeSubscription?.cancelAtPeriodEnd;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your subscription and view credit history</p>
      </div>

      <Tabs defaultValue="subscription">
        <TabsList className="mb-6">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="credits">Credits History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subscription Details</CardTitle>
                {getStatusBadge(subscription.subscriptionStatus)}
              </div>
              <CardDescription>
                {subscription.subscriptionType.charAt(0).toUpperCase() + subscription.subscriptionType.slice(1)} Plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Current Credits</p>
                  <p>{subscription.credits}</p>
                </div>
              </div>

              {subscription.subscriptionStatus === 'trialing' && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Trial Ends</p>
                    <p>{formatDate(subscription.trialEndsAt)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Next Billing Date</p>
                  <p>{formatDate(subscription.nextBillingDate)}</p>
                </div>
              </div>

              {isCanceledAtPeriodEnd && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">Subscription Cancellation Scheduled</p>
                      <p className="text-yellow-700 text-sm">
                        Your subscription will be canceled on {formatDate(subscription.nextBillingDate)}.
                        You can continue to use your subscription until this date.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isCanceledAtPeriodEnd ? (
                <Button 
                  variant="outline" 
                  onClick={handleResumeSubscription}
                  disabled={isResuming}
                >
                  {isResuming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resume Subscription
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel Subscription
                </Button>
              )}
              
              <Button onClick={() => navigate('/subscription/plans')}>
                Change Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          {/* Credit History */}
          <Card>
            <CardHeader>
              <CardTitle>Credit History</CardTitle>
              <CardDescription>Your credit transactions history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : creditHistoryData?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No credit transactions found
                </div>
              ) : (
                <div className="space-y-4">
                  {creditHistoryData?.data.map((transaction) => (
                    <div key={transaction._id} className="flex items-start justify-between border-b pb-4">
                      <div className="flex items-start gap-3">
                        <ReceiptText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.type}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount} credits
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManagement;
