import { baseApi } from './baseApi';

export interface SubscriptionPlan {
  name: string;
  trialDays: number;
  initialCredits: number;
  monthlyCredits: number;
  interval: string;
  price: number;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  data: {
    regular: SubscriptionPlan;
    premium: SubscriptionPlan;
  };
}

export interface UserSubscription {
  credits: number;
  subscriptionType: 'none' | 'regular' | 'premium';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'none';
  trialEndsAt?: string;
  nextBillingDate?: string;
  stripeSubscription?: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

export interface UserSubscriptionResponse {
  success: boolean;
  data: UserSubscription;
}

export interface CheckoutSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    url: string;
  };
}

export interface CancelSubscriptionResponse {
  success: boolean;
  data: {
    message: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  };
}

export interface ResumeSubscriptionResponse {
  success: boolean;
  data: {
    message: string;
    cancelAtPeriodEnd: boolean;
  };
}

export interface CreditTransaction {
  _id: string;
  user: string;
  amount: number;
  type: 'subscription' | 'purchase' | 'usage' | 'refund' | 'adjustment';
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditHistoryResponse {
  success: boolean;
  count: number;
  data: CreditTransaction[];
}

export interface CreditPackage {
  package: 'small' | 'medium' | 'large';
}

export interface CreditPurchaseResponse {
  success: boolean;
  data: {
    sessionId: string;
    url: string;
  };
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlansResponse, void>({
      query: () => '/subscription/plans',
    }),
    getUserSubscription: builder.query<UserSubscriptionResponse, void>({
      query: () => '/subscription',
      providesTags: ['User'],
    }),
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, { plan: 'regular' | 'premium' }>({
      query: (data) => ({
        url: '/subscription/checkout',
        method: 'POST',
        body: data,
      }),
    }),
    cancelSubscription: builder.mutation<CancelSubscriptionResponse, void>({
      query: () => ({
        url: '/subscription/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    resumeSubscription: builder.mutation<ResumeSubscriptionResponse, void>({
      query: () => ({
        url: '/subscription/resume',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getCreditHistory: builder.query<CreditHistoryResponse, void>({
      query: () => '/subscription/credits/history',
    }),
    purchaseCredits: builder.mutation<CreditPurchaseResponse, CreditPackage>({
      query: (data) => ({
        url: '/subscription/credits/purchase',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetCreditHistoryQuery,
  usePurchaseCreditsMutation,
} = subscriptionApi;
