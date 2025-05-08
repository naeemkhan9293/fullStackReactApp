import { baseApi } from './baseApi';

export interface Wallet {
  _id: string;
  user: string;
  userType: 'customer' | 'provider';
  balance: number;
  isActive: boolean;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  bankAccountConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  wallet: string;
  user: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'service_payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  booking?: string;
  stripePaymentId?: string;
  stripeTransferId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  success: boolean;
  data: Wallet;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
}

export interface ConnectBankResponse {
  success: boolean;
  data: {
    url: string;
  };
}

export interface WithdrawFundsRequest {
  amount: number;
}

export interface WithdrawFundsResponse {
  success: boolean;
  data: {
    transaction: Transaction;
    wallet: Wallet;
  };
}

export interface AddMoneyRequest {
  amount: number;
}

export interface AddMoneyResponse {
  success: boolean;
  data: {
    clientSecret: string;
  };
}

export interface ConfirmDepositRequest {
  paymentIntentId: string;
  amount: number;
}

export interface ConfirmDepositResponse {
  success: boolean;
  data: {
    transaction: Transaction;
    wallet: Wallet;
  };
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<WalletResponse, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    getWalletTransactions: builder.query<TransactionsResponse, void>({
      query: () => '/wallet/transactions',
      providesTags: ['Wallet'],
    }),
    // Provider endpoints
    connectBankAccount: builder.mutation<ConnectBankResponse, void>({
      query: () => ({
        url: '/wallet/connect-bank',
        method: 'POST',
      }),
    }),
    withdrawFunds: builder.mutation<WithdrawFundsResponse, WithdrawFundsRequest>({
      query: (data) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
    // Customer endpoints
    addMoneyToWallet: builder.mutation<AddMoneyResponse, AddMoneyRequest>({
      query: (data) => ({
        url: '/wallet/add-money',
        method: 'POST',
        body: data,
      }),
    }),
    confirmWalletDeposit: builder.mutation<ConfirmDepositResponse, ConfirmDepositRequest>({
      query: (data) => ({
        url: '/wallet/confirm-deposit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useConnectBankAccountMutation,
  useWithdrawFundsMutation,
  useAddMoneyToWalletMutation,
  useConfirmWalletDepositMutation,
} = walletApi;
