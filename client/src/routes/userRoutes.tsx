import UserLayout from "@/layouts/UserLayout";
import Dashboard from "@/pages/user/Dashboard";
import Profile from "@/pages/user/Profile";
import MyServices from "@/pages/user/MyServices";
import MyBookings from "@/pages/user/MyBookings";
import BookingDetails from "@/pages/user/BookingDetails";
import CreateService from "@/pages/user/CreateService";
import EditService from "@/pages/user/EditService";
import History from "@/pages/user/History";
import SavedServicesPage from "@/pages/user/SavedServicesPage";
import SubscriptionManagement from "@/pages/subscription/SubscriptionManagement";
import ProviderWalletPage from "@/pages/provider/WalletPage";
import CustomerWalletPage from "@/pages/customer/CustomerWalletPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// Component to select the appropriate wallet page based on user role
const WalletSelector = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isProvider = user?.role === 'provider';

  return isProvider ? <ProviderWalletPage /> : <CustomerWalletPage />;
};

export const userRoutes = [
  {
    path: "/user",
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "my-services", element: <MyServices /> },
          { path: "my-bookings", element: <MyBookings /> },
          { path: "booking/:id", element: <BookingDetails /> },
          { path: "create-service", element: <CreateService /> },
          { path: "edit-service/:id", element: <EditService /> },
          { path: "history", element: <History /> },
          { path: "saved", element: <SavedServicesPage /> },
          { path: "subscription", element: <SubscriptionManagement /> },
          {
            path: "wallet",
            element: (
              <WalletSelector />
            )
          },
        ],
      },
    ],
  },
];
