import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";
import { useGetUserSubscriptionQuery } from "@/store/api/subscriptionApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Briefcase, CreditCard, Plus, Coins } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  // Fetch user subscription data to get credits
  const { data: userSubscription, isLoading: isLoadingSubscription } = useGetUserSubscriptionQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Get user credits
  const userCredits = userSubscription?.data?.credits || 0;

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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold hover:text-primary transition-colors"
          >
            LocalConnect
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Marketplace</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          to="/marketplace"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Services Marketplace
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Browse and book local services from trusted
                            providers in your area
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem to="/marketplace" title="All Services">
                      Browse all available services
                    </ListItem>
                    <ListItem to="/marketplace?sort=trending" title="Trending">
                      See what's popular right now
                    </ListItem>
                    <ListItem
                      to="/marketplace?sort=newest"
                      title="New Providers"
                    >
                      The latest service providers to join
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className="px-4 py-2 hover:text-primary">
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className="px-4 py-2 hover:text-primary">
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-5 ">
          {isAuthenticated && user ? (
            <>
              {/* Credits Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 p-5 ">
                    <Coins className="h-4 w-4" />
                    <span>{isLoadingSubscription ? "..." : userCredits}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">Credits</Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Your Credits</p>
                      <div className="flex items-center mt-2">
                        <Coins className="h-5 w-5 text-primary mr-2" />
                        <span className="text-xl font-bold">{userCredits}</span>
                      </div>
                      {user.role === "provider" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Creating a service costs 5 credits
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/subscription/credits")}>
                    <Coins className="mr-2 h-4 w-4" />
                    <span>View Credit History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/subscription/get-credits")}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Buy More Credits</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/user/subscription")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Manage Subscription</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-12 w-12">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'provider' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role === 'provider' ? 'Service Provider' : user.role === 'admin' ? 'Administrator' : 'Customer'}
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
                  {user.role === "provider" && (
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
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const ListItem = ({
  className,
  title,
  children,
  to,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  to: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

export default Navbar;
