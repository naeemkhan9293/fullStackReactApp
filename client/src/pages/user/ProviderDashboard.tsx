import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ProviderDashboard = () => {
  // Mock data
  const userStats = {
    servicesOffered: 8,
    activeBookings: 5,
    pendingRequests: 3,
    totalEarnings: "$1,245",
  };

  const recentActivity = [
    {
      id: 1,
      type: "booking",
      service: "Home Cleaning",
      amount: "$75",
      date: "2 hours ago",
    },
    {
      id: 2,
      type: "completed",
      service: "Lawn Mowing",
      amount: "$45",
      date: "1 day ago",
    },
    {
      id: 3,
      type: "request",
      service: "Plumbing Repair",
      amount: "$120",
      date: "3 days ago",
    },
    {
      id: 4,
      type: "review",
      service: "Furniture Assembly",
      rating: 5,
      date: "5 days ago",
    },
  ];

  const popularServices = [
    { id: 1, name: "Home Cleaning", icon: "🧹", price: "$75", rating: 4.8 },
    { id: 2, name: "Lawn Mowing", icon: "🌿", price: "$45", rating: 4.7 },
    { id: 3, name: "Plumbing Repair", icon: "🔧", price: "$120", rating: 4.9 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.servicesOffered}
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
            <div className="text-2xl font-bold">{userStats.activeBookings}</div>
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
            <div className="text-2xl font-bold">
              {userStats.pendingRequests}
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
            <div className="text-2xl font-bold">{userStats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest bookings, requests, and reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center p-3 bg-muted rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {activity.type === "booking" && "New booking for"}
                        {activity.type === "completed" && "Completed"}
                        {activity.type === "request" && "New request for"}
                        {activity.type === "review" &&
                          "Received review for"}{" "}
                        <span className="font-semibold">
                          {activity.service}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                    {activity.amount ? (
                      <p className="font-bold">{activity.amount}</p>
                    ) : activity.rating ? (
                      <p className="font-bold">★ {activity.rating}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
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
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>
                Most booked services on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularServices.map((service) => (
                  <div key={service.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-muted text-xl">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ⭐ {service.rating}
                      </p>
                    </div>
                    <p className="font-bold">{service.price}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
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
        <Button className="flex-1" asChild>
          <Link to="/user/create-service">Create New Service</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link to="/marketplace">Browse Services</Link>
        </Button>
      </div>
    </div>
  );
};

export default ProviderDashboard;
