import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Calendar, Clock, DollarSign, Loader2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useGetProviderDashboardStatsQuery,
  useGetProviderRecentActivityQuery,
  useGetProviderPopularServicesQuery,
} from "@/store/api/providerDashboardApi";

const ProviderDashboard = () => {
  // Fetch dashboard stats
  const { data: statsData, isLoading: isStatsLoading } = useGetProviderDashboardStatsQuery();

  // Fetch recent activity
  const { data: activityData, isLoading: isActivityLoading } = useGetProviderRecentActivityQuery();

  // Fetch popular services
  const { data: popularServicesData, isLoading: isPopularServicesLoading } = useGetProviderPopularServicesQuery();

  // Format relative time (e.g., "3 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get service icon based on category
  const getServiceIcon = (category: string): string => {
    const icons: Record<string, string> = {
      Home: "🏠",
      Outdoor: "🌿",
      Education: "📚",
      Pets: "🐾",
      Tech: "💻",
      Health: "🩺",
      Beauty: "💇",
      Other: "🔧",
    };
    return icons[category] || "🔧";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  statsData?.data.servicesOffered || 0
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link
                to="/user/my-services"
                className="text-primary hover:underline"
              >
                View all
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  statsData?.data.activeBookings || 0
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link
                to="/user/my-bookings"
                className="text-primary hover:underline"
              >
                View bookings
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  statsData?.data.pendingRequests || 0
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link
                to="/user/requests"
                className="text-primary hover:underline"
              >
                View requests
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  `$${statsData?.data.totalEarnings || 0}`
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest bookings, requests, and reviews
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isActivityLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : activityData?.data.length ? (
                <div className="space-y-4">
                  {activityData.data.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-muted rounded-md gap-2"
                    >
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {activity.type === "booking" && "New booking for"}
                          {activity.type === "completed" && "Completed"}
                          {activity.type === "request" && "New request for"}
                          {activity.type === "review" &&
                            "Received review for"}{" "}
                          <span className="font-semibold">
                            {activity.service}
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatRelativeTime(activity.date)}
                        </p>
                      </div>
                      <div className="flex justify-between sm:justify-end items-center w-full sm:w-auto">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary sm:hidden">
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                        {activity.amount ? (
                          <p className="font-bold">${activity.amount}</p>
                        ) : activity.rating ? (
                          <p className="font-bold">★ {activity.rating}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link to="/user/activity">View All Activity</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Services */}
        <div>
          <Card>
            <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Popular Services</CardTitle>
                <CardDescription>
                  Most booked services on the platform
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isPopularServicesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : popularServicesData?.data.length ? (
                <div className="space-y-4">
                  {popularServicesData.data.map((service) => (
                    <div key={service.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-muted text-xl">
                        {getServiceIcon(service.category)}
                      </div>
                      <div className="flex-1 min-w-0"> {/* prevent text overflow */}
                        <p className="font-medium truncate">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                            {service.rating.toFixed(1)}
                          </span>
                        </p>
                      </div>
                      <p className="font-bold whitespace-nowrap">${service.price}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No popular services found</p>
                </div>
              )}
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link to="/marketplace">Browse All Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="flex-1 py-6 text-base" asChild>
          <Link to="/user/create-service">Create New Service</Link>
        </Button>
        <Button variant="outline" className="flex-1 py-6 text-base" asChild>
          <Link to="/marketplace">Browse Services</Link>
        </Button>
      </div>
    </div>
  );
};

export default ProviderDashboard;
