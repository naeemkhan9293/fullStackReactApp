import { useState } from 'react';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { useGetWalletQuery, useGetWalletTransactionsQuery, useAddMoneyToWalletMutation } from '@/store/api/walletApi';
import { Transaction } from '@/store/api/walletApi';
import AddMoneyForm from '@/components/payment/AddMoneyForm';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CustomerWalletPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Get wallet data
  const { data: walletData, isLoading: isLoadingWallet } = useGetWalletQuery();
  
  // Get wallet transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetWalletTransactionsQuery();
  
  // Add money mutation
  const [addMoney, { isLoading: isAddingMoney }] = useAddMoneyToWalletMutation();

  // Handle add money
  const handleAddMoney = async () => {
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount to add.',
      });
      return;
    }
    
    try {
      const response = await addMoney({ amount: amountValue }).unwrap();
      setClientSecret(response.data.clientSecret);
    } catch (error: any) {
      toast.error('Failed to process payment', {
        description: error.data?.error || 'An error occurred. Please try again.',
      });
    }
  };

  // Get transaction icon based on type
  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownToLine className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpFromLine className="h-5 w-5 text-orange-500" />;
      case 'service_payment':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'refund':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Loading state
  if (isLoadingWallet) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading Wallet</CardTitle>
            <CardDescription>Please wait while we load your wallet information...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create wallet if it doesn't exist
  if (!walletData?.data) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Wallet Not Found</CardTitle>
            <CardDescription>You don't have a wallet yet.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p>Your wallet will be created automatically when you add money for the first time.</p>
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wallet = walletData.data;

  return (
    <div className="container max-w-4xl py-8">
      <Card className="w-full mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">My Wallet</CardTitle>
              <CardDescription>Manage your funds for booking services</CardDescription>
            </div>
            <Wallet className="h-10 w-10 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Available Balance</h3>
            <p className="text-4xl font-bold">${wallet.balance.toFixed(2)}</p>
          </div>
          
          {!clientSecret ? (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add Money</CardTitle>
                  <CardDescription>Add funds to your wallet to book services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0.01"
                          step="0.01"
                        />
                        <Button 
                          onClick={handleAddMoney} 
                          disabled={isAddingMoney || !amount || parseFloat(amount) <= 0}
                        >
                          {isAddingMoney ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Add Money
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Payment</CardTitle>
                  <CardDescription>Complete your payment to add funds</CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <AddMoneyForm 
                      clientSecret={clientSecret} 
                      amount={parseFloat(amount)}
                      onSuccess={() => {
                        setClientSecret(null);
                        setAmount('');
                      }}
                    />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">Transaction History</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your wallet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !transactionsData?.data || transactionsData.data.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
              ) : (
                <div className="space-y-4">
                  {transactionsData.data.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
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

export default CustomerWalletPage;
