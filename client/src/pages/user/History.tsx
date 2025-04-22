// Component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const History = () => {
  // Mock data for completed and cancelled bookings
  const completedBookings = [
    {
      id: 1,
      service: "Home Cleaning",
      provider: "CleanPro Services",
      date: "May 15, 2023",
      amount: "$75",
      reviewed: true,
      rating: 4,
    },
    {
      id: 2,
      service: "Lawn Mowing",
      provider: "Green Thumb Landscaping",
      date: "May 10, 2023",
      amount: "$45",
      reviewed: false,
    },
    {
      id: 3,
      service: "Plumbing Repair",
      provider: "Quick Fix Plumbing",
      date: "April 28, 2023",
      amount: "$120",
      reviewed: true,
      rating: 5,
    },
    {
      id: 4,
      service: "Furniture Assembly",
      provider: "Assembly Experts",
      date: "April 15, 2023",
      amount: "$85",
      reviewed: true,
      rating: 3,
    },
  ];

  const cancelledBookings = [
    {
      id: 5,
      service: "Computer Repair",
      provider: "Tech Wizards",
      date: "May 5, 2023",
      amount: "$60",
      reason: "Provider unavailable",
    },
    {
      id: 6,
      service: "House Painting",
      provider: "Perfect Painters",
      date: "April 20, 2023",
      amount: "$200",
      reason: "Rescheduled",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Booking History</h1>
        <p className="text-muted-foreground">View your past service bookings</p>
      </div>

      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{booking.service}</h3>
                    <p className="text-sm text-muted-foreground">Provider: {booking.provider}</p>
                    <p className="text-sm text-muted-foreground">Date: {booking.date}</p>

                    {booking.reviewed ? (
                      <div className="flex items-center mt-2">
                        <p className="text-sm mr-2">Your rating:</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < booking.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-2">
                        Leave Review
                      </Button>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">{booking.amount}</p>
                    <Badge className="mt-2" variant="outline">Completed</Badge>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">Book Again</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{booking.service}</h3>
                    <p className="text-sm text-muted-foreground">Provider: {booking.provider}</p>
                    <p className="text-sm text-muted-foreground">Date: {booking.date}</p>
                    <p className="text-sm text-red-500 mt-2">Reason: {booking.reason}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">{booking.amount}</p>
                    <Badge className="mt-2" variant="destructive">Cancelled</Badge>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">Book Again</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
