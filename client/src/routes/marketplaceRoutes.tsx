import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import ServiceMarketplace from "@/pages/marketplace/ServiceMarketplace";
import ServiceDetails from "@/pages/marketplace/ServiceDetails";
import BookingPage from "@/pages/marketplace/BookingPage";

export const marketplaceRoutes = [
  {
    path: "/marketplace",
    element: <MarketplaceLayout />,
    children: [
      { path: "", element: <ServiceMarketplace /> },
      { path: "service/:id", element: <ServiceDetails /> },
      { path: "book/:id", element: <BookingPage /> },
    ],
  },
];
