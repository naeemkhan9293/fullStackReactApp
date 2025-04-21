import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { LogOut, User, LayoutDashboard, Briefcase, Calendar, Clock, Star, Settings } from "lucide-react";
import { toast } from "sonner";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";
import { RootState } from "@/store/store";

const UserLayout = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  // Get user role from Redux store
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const isProvider = authUser?.role === "provider" || authUser?.role === "admin";

  // Define navigation items based on user role
  const providerNavItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { name: "My Services", path: "/user/my-services", icon: <Briefcase className="mr-2 h-4 w-4" /> },
    { name: "My Bookings", path: "/user/my-bookings", icon: <Calendar className="mr-2 h-4 w-4" /> },
    { name: "Profile", path: "/user/profile", icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  const consumerNavItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { name: "My Bookings", path: "/user/my-bookings", icon: <Calendar className="mr-2 h-4 w-4" /> },
    { name: "Booking History", path: "/user/history", icon: <Clock className="mr-2 h-4 w-4" /> },
    { name: "Saved Services", path: "/user/saved", icon: <Star className="mr-2 h-4 w-4" /> },
    { name: "Profile", path: "/user/profile", icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  // Select the appropriate navigation items based on user role
  const navItems = isProvider ? providerNavItems : consumerNavItems;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link to={item.path}>
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
          {/* Create Service button for providers */}
          {isProvider && (
            <Button
              variant="outline"
              className="w-full justify-start mt-4"
              asChild
            >
              <Link to="/user/create-service">
                <Briefcase className="mr-2 h-4 w-4" />
                Create Service
              </Link>
            </Button>
          )}

          <div className="border-t my-4 pt-4">
            <div className="flex items-center gap-2 mb-4 px-3">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
