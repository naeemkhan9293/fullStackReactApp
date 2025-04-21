import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ProviderDashboard from "./ProviderDashboard";
import ConsumerDashboard from "./ConsumerDashboard";

const Dashboard = () => {
  // Get user role from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // Determine which dashboard to show based on user role
  const isProvider = user?.role === "provider" || user?.role === "admin";

  return isProvider ? <ProviderDashboard /> : <ConsumerDashboard />;
};

export default Dashboard;
