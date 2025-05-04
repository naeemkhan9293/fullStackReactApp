import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import SubscriptionPlans from "@/pages/subscription/SubscriptionPlans";
import SubscriptionSuccess from "@/pages/subscription/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/subscription/SubscriptionCancel";

export const subscriptionRoutes = [
  {
    path: "/subscription",
    element: <MarketplaceLayout />,
    children: [
      { path: "plans", element: <SubscriptionPlans /> },
      { path: "success", element: <SubscriptionSuccess /> },
      { path: "cancel", element: <SubscriptionCancel /> },
    ],
  },
];
