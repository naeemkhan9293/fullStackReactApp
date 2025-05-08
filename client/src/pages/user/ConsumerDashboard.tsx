import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Clock, Loader2, Wallet, Sparkles } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  useGetDashboardStatsQuery,
  useGetUpcomingServicesQuery,
  useGetRecentBookingsQuery
} from "@/store/api/dashboardApi";
import { useGetUserSubscriptionQuery } from "@/store/api/subscriptionApi";
import { useGetWalletQuery } from "@/store/api/walletApi";

const ConsumerDashboard = () => {
  // Fetch dashboard stats
  const { data: statsData, isLoading: isStatsLoading } = useGetDashboardStatsQuery();

  // Fetch upcoming services
  const { data: upcomingServicesData, isLoading: isUpcomingServicesLoading } = useGetUpcomingServicesQuery();

  // Fetch recent bookings
  const { data: recentBookingsData, isLoading: isRecentBookingsLoading } = useGetRecentBookingsQuery();

  // Fetch user subscription
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useGetUserSubscriptionQuery();

  // Fetch user wallet
  const { data: walletData, isLoading: isWalletLoading } = useGetWalletQuery();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, h:mm a");
  };

  // Format relative time (e.g., "3 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const recommendedServices = [
    { id: 1, name: "Home Cleaning", icon: "🧹", provider: "CleanPro Services", price: "$75", rating: 4.8 },
    { id: 2, name: "Lawn Mowing", icon: "🌿", provider: "Green Thumb Landscaping", price: "$45", rating: 4.7 },
    { id: 3, name: "Plumbing Repair", icon: "🔧", provider: "Quick Fix Plumbing", price: "$120", rating: 4.9 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your services.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarClock className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  statsData?.data.activeBookings || 0
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/user/my-bookings" className="text-primary hover:underline">View bookings</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  statsData?.data.upcomingServices || 0
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/user/my-bookings" className="text-primary hover:underline">View schedule</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {isWalletLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  `$${walletData?.data?.balance?.toFixed(2) || '0.00'}`
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/user/wallet" className="text-primary hover:underline">Manage wallet</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <div className="text-lg font-bold capitalize">
                {isSubscriptionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  subscriptionData?.data.subscriptionType === 'none' ? 'No Plan' : subscriptionData?.data.subscriptionType
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscriptionData?.data.subscriptionType === 'none' ? (
                <Link to="/subscription/plans" className="text-primary hover:underline">Get a subscription</Link>
              ) : (
                <Link to="/user/subscription" className="text-primary hover:underline">View details</Link>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Services and Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Services</CardTitle>
              <CardDescription>Services scheduled for the next few days</CardDescription>
            </CardHeader>
            <CardContent>
              {isUpcomingServicesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingServicesData?.data.length ? (
                <div className="space-y-4">
                  {upcomingServicesData.data.map((booking) => (
                    <div key={booking._id} className="flex justify-between items-center p-4 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{booking.serviceName}</p>
                        <p className="text-sm text-muted-foreground">Provider: {booking.providerName}</p>
                        <p className="text-sm font-medium text-primary">{formatDate(booking.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${booking.price}</p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <Link to={`/user/booking/${booking._id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No upcoming services scheduled</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link to="/marketplace">Book a Service</Link>
                  </Button>
                </div>
              )}
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/user/my-bookings">View All Bookings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your recent service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {isRecentBookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookingsData?.data.map((booking) => (
                    <div key={booking._id} className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{booking.serviceName}</p>
                        <p className="font-bold">${booking.price}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.providerName}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(booking.createdAt)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : booking.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      {booking.status === "completed" && (
                        <Button variant="ghost" size="sm" className="mt-1 h-8" asChild>
                          <Link to={`/marketplace/service/${booking._id}`}>Leave Review</Link>
                        </Button>
                      )}
                      <div className="border-t my-2"></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/user/history">View Booking History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended Services */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
          <CardDescription>Services you might be interested in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedServices.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-muted text-xl">
                    {service.icon}
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.provider}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">⭐ {service.rating}</p>
                  <p className="font-bold">{service.price}</p>
                </div>
                <Button className="w-full mt-3" size="sm" asChild>
                  <Link to={`/marketplace/service/${service.id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="flex-1" asChild>
          <Link to="/marketplace">Book a Service</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link to="/user/my-bookings">Manage Bookings</Link>
        </Button>
        <Button variant="outline" className="flex-1 border-green-500 text-green-600 hover:bg-green-50" asChild>
          <Link to="/user/wallet">Add Money to Wallet</Link>
        </Button>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
