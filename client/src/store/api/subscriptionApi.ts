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

export interface SubscriptionDetails {
  id: string;
  name: string;
  subscriptionType: 'regular' | 'premium';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired';
  isActive: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeSubscriptionId: string;
  stripeData?: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

export interface AllSubscriptionsResponse {
  success: boolean;
  count: number;
  data: SubscriptionDetails[];
}

export interface DebugSubscriptionsResponse {
  success: boolean;
  count: number;
  userSubscriptionsArray: string[];
  data: SubscriptionDetails[];
}

export interface CreateTestSubscriptionResponse {
  success: boolean;
  message: string;
  data: SubscriptionDetails;
}

export interface ActivateSubscriptionResponse {
  success: boolean;
  data: {
    message: string;
    subscription: {
      id: string;
      name: string;
      subscriptionType: 'regular' | 'premium';
      status: string;
    };
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

export interface SyncSubscriptionsResponse {
  success: boolean;
  message: string;
  newSubscriptions: SubscriptionDetails[];
  stripeSubscriptionsCount: number;
  dbSubscriptionsCount: number;
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
    getAllUserSubscriptions: builder.query<AllSubscriptionsResponse, void>({
      query: () => '/subscription/all',
      providesTags: ['Subscriptions'],
    }),
    debugSubscriptions: builder.query<DebugSubscriptionsResponse, void>({
      query: () => '/subscription/debug',
    }),
    createTestSubscription: builder.mutation<CreateTestSubscriptionResponse, { plan: 'regular' | 'premium' }>({
      query: (data) => ({
        url: '/subscription/debug/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscriptions'],
    }),
    activateSubscription: builder.mutation<ActivateSubscriptionResponse, string>({
      query: (id) => ({
        url: `/subscription/activate/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Subscriptions'],
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
      invalidatesTags: ['User', 'Subscriptions'],
    }),
    resumeSubscription: builder.mutation<ResumeSubscriptionResponse, void>({
      query: () => ({
        url: '/subscription/resume',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Subscriptions'],
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
    syncSubscriptions: builder.mutation<SyncSubscriptionsResponse, void>({
      query: () => ({
        url: '/subscription/sync',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Subscriptions'],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionQuery,
  useGetAllUserSubscriptionsQuery,
  useDebugSubscriptionsQuery,
  useCreateTestSubscriptionMutation,
  useActivateSubscriptionMutation,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetCreditHistoryQuery,
  usePurchaseCreditsMutation,
  useSyncSubscriptionsMutation,
} = subscriptionApi;
