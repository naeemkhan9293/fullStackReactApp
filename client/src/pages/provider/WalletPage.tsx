import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useGetWalletQuery, useGetWalletTransactionsQuery, useConnectBankAccountMutation, useWithdrawFundsMutation } from '@/store/api/walletApi';
import { Transaction } from '@/store/api/walletApi';

const WalletPage = () => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  
  // Get wallet data
  const { data: walletData, isLoading: isLoadingWallet } = useGetWalletQuery();
  
  // Get wallet transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetWalletTransactionsQuery();
  
  // Connect bank account mutation
  const [connectBankAccount, { isLoading: isConnectingBank }] = useConnectBankAccountMutation();
  
  // Withdraw funds mutation
  const [withdrawFunds, { isLoading: isWithdrawing }] = useWithdrawFundsMutation();

  // Handle connect bank account
  const handleConnectBank = async () => {
    try {
      const response = await connectBankAccount().unwrap();
      window.location.href = response.data.url;
    } catch (error: any) {
      toast.error('Failed to connect bank account', {
        description: error.data?.error || 'An error occurred. Please try again.',
      });
    }
  };

  // Handle withdraw funds
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount to withdraw.',
      });
      return;
    }
    
    if (!walletData?.data || amount > walletData.data.balance) {
      toast.error('Insufficient funds', {
        description: 'You do not have enough funds to withdraw this amount.',
      });
      return;
    }
    
    try {
      await withdrawFunds({ amount }).unwrap();
      toast.success('Withdrawal successful', {
        description: `$${amount.toFixed(2)} has been withdrawn to your bank account.`,
      });
      setWithdrawAmount('');
    } catch (error: any) {
      toast.error('Failed to withdraw funds', {
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
            <p>Your wallet will be created automatically when you receive your first payment.</p>
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
              <CardTitle className="text-2xl">Provider Wallet</CardTitle>
              <CardDescription>Manage your earnings and withdrawals</CardDescription>
            </div>
            <Wallet className="h-10 w-10 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Available Balance</h3>
            <p className="text-4xl font-bold">${wallet.balance.toFixed(2)}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {wallet.bankAccountConnected ? (
            <div className="w-full max-w-md">
              <Label htmlFor="withdrawAmount">Withdraw to Bank Account</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="Amount to withdraw"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  max={wallet.balance.toString()}
                />
                <Button 
                  onClick={handleWithdraw} 
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet.balance}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleConnectBank} disabled={isConnectingBank}>
              {isConnectingBank ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Bank Account'
              )}
            </Button>
          )}
        </CardFooter>
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

export default WalletPage;
