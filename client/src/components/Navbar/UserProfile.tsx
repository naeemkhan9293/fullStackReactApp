import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Briefcase } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";
import { toast } from "sonner";

const UserProfile = () => {
  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out successfully");
      navigate("/auth/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-12 w-12">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback>
                {getInitials(user?.name || "")}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <div className="mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  user?.role === "provider"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user?.role === "provider"
                  ? "Service Provider"
                  : user?.role === "admin"
                  ? "Administrator"
                  : "Customer"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/user/dashboard")}>
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/user/profile")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {user?.role === "provider" && (
          <DropdownMenuItem
            onClick={() => navigate("/user/my-services")}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            <span>My Services</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
