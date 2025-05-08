import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import ServiceMarketplace from "@/pages/marketplace/ServiceMarketplace";
import ServiceDetails from "@/pages/marketplace/ServiceDetails";
import BookingPage from "@/pages/marketplace/BookingPage";
import BookingPaymentPage from "@/pages/marketplace/BookingPaymentPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const marketplaceRoutes = [
  {
    path: "/marketplace",
    element: <MarketplaceLayout />,
    children: [
      { path: "", element: <ServiceMarketplace /> },
      { path: "service/:id", element: <ServiceDetails /> },
      { path: "book/:id", element: <BookingPage /> },
      {
        path: "payment/:id",
        element: <ProtectedRoute allowedRoles={["customer"]} />,
        children: [
          {
            path: "",
            element: <BookingPaymentPage />,
          },
        ],
      },
    ],
  },
];
