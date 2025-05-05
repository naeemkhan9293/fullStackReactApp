import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import SubscriptionPlans from "@/pages/subscription/SubscriptionPlans";
import SubscriptionSuccess from "@/pages/subscription/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/subscription/SubscriptionCancel";
import GetCreditsPage from "@/pages/subscription/GetCreditsPage";
import CreditsPage from "@/pages/subscription/CreditsPage";

export const subscriptionRoutes = [
  {
    path: "/subscription",
    element: <MarketplaceLayout />,
    children: [
      { path: "plans", element: <SubscriptionPlans /> },
      { path: "success", element: <SubscriptionSuccess /> },
      { path: "cancel", element: <SubscriptionCancel /> },
      { path: "get-credits", element: <GetCreditsPage /> },
      { path: "credits", element: <CreditsPage /> },
    ],
  },
];
