import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  Coins,
  ArrowRight,
  Plus,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetUserSubscriptionQuery,
  useGetCreditHistoryQuery,
  useCreateCheckoutSessionMutation,
} from "@/store/api/subscriptionApi";

const CreditsPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<
    "regular" | "premium" | null
  >(null);

  // Fetch user's subscription
  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useGetUserSubscriptionQuery();

  // Fetch credit history
  const { data: creditHistoryData, isLoading: isLoadingHistory } =
    useGetCreditHistoryQuery();

  // Create checkout session mutation
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutSessionMutation();

  // Handle subscription checkout
  const handleSubscribe = async (plan: "regular" | "premium") => {
    try {
      setSelectedPlan(plan);
      const response = await createCheckoutSession({ plan }).unwrap();

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error("Failed to create subscription", {
        description:
          error.data?.error || "An error occurred. Please try again.",
      });
      setSelectedPlan(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading state
  if (isLoadingSubscription) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading credit information...</p>
      </div>
    );
  }

  const userCredits = subscriptionData?.data.credits || 0;
  const subscription = subscriptionData?.data || null;
  const transactions = creditHistoryData?.data || [];

  return (
    <div className="container max-w-4xl py-8 m-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Credits & Subscription</h1>
        <Button onClick={() => navigate("/subscription/get-credits")}>
          <Plus className="mr-2 h-4 w-4" />
          Get More Credits
        </Button>
      </div>

      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-6">
          {/* Credit Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Balance</CardTitle>
              <CardDescription>
                Your current credits and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Available Credits
                    </p>
                    <p className="text-3xl font-bold">{userCredits}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/subscription/get-credits")}
                >
                  Add Credits
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {subscription?.subscriptionType !== "none" && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">
                    Current Subscription
                  </h3>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {subscription?.subscriptionType
                          ? subscription.subscriptionType
                              .charAt(0)
                              .toUpperCase() +
                            subscription.subscriptionType.slice(1)
                          : "No"}
                        Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        {subscription?.subscriptionStatus
                          ? subscription?.subscriptionStatus
                              .charAt(0)
                              .toUpperCase() +
                            subscription?.subscriptionStatus.slice(1)
                          : "No"}
                      </p>
                      {subscription?.nextBillingDate && (
                        <p className="text-sm text-muted-foreground">
                          Next billing:{" "}
                          {new Date(
                            subscription.nextBillingDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Credit Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-1.5 rounded-full mr-3">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Service Creation</span>
                    </div>
                    <span className="font-medium">5 credits</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/user/subscription")}
              >
                Manage Subscription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Credit History */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Transaction History</CardTitle>
              <CardDescription>Your recent credit transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No credit transactions found
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-start justify-between border-b pb-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.amount > 0
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.amount > 0 ? (
                            <Plus className={`h-4 w-4 text-green-600`} />
                          ) : (
                            <Coins className={`h-4 w-4 text-red-600`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditsPage;
