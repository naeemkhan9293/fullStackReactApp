import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coins, Plus, CreditCard } from "lucide-react";
import { useGetUserSubscriptionQuery } from "@/store/api/subscriptionApi";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "@/store/slices/authSlice";

const UserCredits = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Fetch user subscription data to get credits
  const { data: userSubscription, isLoading: isLoadingSubscription } =
    useGetUserSubscriptionQuery(undefined, {
      skip: !isAuthenticated,
    });

  // Get user credits
  const userCredits = userSubscription?.data?.credits || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 p-5"
        >
          <Coins className="h-4 w-4" />
          <span>{isLoadingSubscription ? "..." : userCredits}</span>
          <Badge variant="secondary" className="ml-1 text-xs">
            Credits
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              Your Credits
            </p>
            <div className="flex items-center mt-2">
              <Coins className="h-5 w-5 text-primary mr-2" />
              <span className="text-xl font-bold">{userCredits}</span>
            </div>
            {user?.role === "provider" && (
              <p className="text-xs text-muted-foreground mt-1">
                Creating a service costs 5 credits
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/subscription/credits")}
        >
          <Coins className="mr-2 h-4 w-4" />
          <span>View Credit History</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/subscription/get-credits")}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Buy More Credits</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/user/subscription")}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Manage Subscription</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserCredits;
