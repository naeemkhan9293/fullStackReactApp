import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Clock, Star, History } from "lucide-react";

const ConsumerDashboard = () => {
  // Mock data for consumer dashboard
  const userStats = {
    activeBookings: 3,
    upcomingServices: 2,
    completedServices: 8,
    savedServices: 5,
  };

  const upcomingServices = [
    { id: 1, service: "Home Cleaning", provider: "CleanPro Services", date: "Tomorrow, 10:00 AM", amount: "$75" },
    { id: 2, service: "Lawn Mowing", provider: "Green Thumb Landscaping", date: "Friday, 2:00 PM", amount: "$45" },
  ];

  const recentBookings = [
    { id: 1, service: "Plumbing Repair", provider: "Quick Fix Plumbing", status: "completed", date: "3 days ago", amount: "$120" },
    { id: 2, service: "Furniture Assembly", provider: "Assembly Experts", status: "completed", date: "1 week ago", amount: "$85" },
    { id: 3, service: "Computer Repair", provider: "Tech Wizards", status: "cancelled", date: "2 weeks ago", amount: "$60" },
  ];

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
              <div className="text-2xl font-bold">{userStats.activeBookings}</div>
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
              <div className="text-2xl font-bold">{userStats.upcomingServices}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/user/my-bookings" className="text-primary hover:underline">View schedule</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <History className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{userStats.completedServices}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/user/history" className="text-primary hover:underline">View history</Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saved Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{userStats.savedServices}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/user/saved" className="text-primary hover:underline">View saved</Link>
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
              {upcomingServices.length > 0 ? (
                <div className="space-y-4">
                  {upcomingServices.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center p-4 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">Provider: {booking.provider}</p>
                        <p className="text-sm font-medium text-primary">{booking.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{booking.amount}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Reschedule
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
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{booking.service}</p>
                      <p className="font-bold">{booking.amount}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.provider}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">{booking.date}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {booking.status === "completed" ? "Completed" : "Cancelled"}
                      </span>
                    </div>
                    {booking.status === "completed" && (
                      <Button variant="ghost" size="sm" className="mt-1 h-8">
                        Leave Review
                      </Button>
                    )}
                    <div className="border-t my-2"></div>
                  </div>
                ))}
              </div>
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
      </div>
    </div>
  );
};

export default ConsumerDashboard;
