import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetMyBookingsQuery, useUpdateBookingStatusMutation } from "@/store/api/bookingApi";
import { Booking } from "@/store/api/bookingApi";

const MyBookings = () => {
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch bookings
  const { data: bookingsData, isLoading, isError, refetch } = useGetMyBookingsQuery();

  // Update booking status mutation
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;

    try {
      await updateBookingStatus({
        id: cancelBookingId,
        status: { status: 'cancelled' }
      }).unwrap();

      toast.success("Booking cancelled successfully");
      setCancelDialogOpen(false);
      setCancelBookingId(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to cancel booking");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  // Error state
  if (isError || !bookingsData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full text-center">
          <h2 className="text-red-600 font-semibold mb-2">Error Loading Bookings</h2>
          <p className="text-muted-foreground mb-4">We couldn't load your bookings. Please try again.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Filter bookings by status
  const bookings = bookingsData.data;

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed"
  );

  const pastBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>This page shows bookings you've made. You can only view details of your own bookings.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                type="upcoming"
                onCancelClick={(id) => {
                  setCancelBookingId(id);
                  setCancelDialogOpen(true);
                }}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">You don't have any upcoming bookings.</p>
                <Button asChild>
                  <Link to="/marketplace">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} type="past" />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You don't have any past bookings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} type="cancelled" />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You don't have any cancelled bookings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>No, Keep Booking</Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Booking Card Component
interface BookingCardProps {
  booking: Booking;
  type: string;
  onCancelClick?: (id: string) => void;
}

const BookingCard = ({ booking, type, onCancelClick }: BookingCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge>Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get service name
  const serviceName = typeof booking.service === 'object' && booking.service.name
    ? booking.service.name
    : 'Service';

  // Get provider name
  const providerName = typeof booking.provider === 'object' && booking.provider.name
    ? booking.provider.name
    : 'Provider';

  // Get service ID for links
  const serviceId = typeof booking.service === 'object' && booking.service._id
    ? booking.service._id
    : booking.service;

  // Check if this is the user's own booking
  // Since we're using the getMyBookings endpoint, all bookings in the list should belong to the current user
  // This is just a safeguard in case we're viewing someone else's booking
  const isOwnBooking = true; // All bookings in MyBookings should be the user's own

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{serviceName}</h2>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-muted-foreground">Provider: {providerName}</p>
            <p>
              <span className="font-medium">Date:</span> {formatDate(booking.date)}
            </p>
            <p>
              <span className="font-medium">Time:</span> {booking.timeSlot}
            </p>
            <p>
              <span className="font-medium">Price:</span> ${booking.price}
            </p>
            <p>
              <span className="font-medium">Address:</span> {booking.address}
            </p>
            {booking.notes && (
              <p>
                <span className="font-medium">Notes:</span> {booking.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[120px]">
            {type === "upcoming" && (
              <>
                {/* Only show View Details for own bookings */}
                {isOwnBooking ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" asChild>
                          <Link to={`/user/booking/${booking._id}`}>View Details</Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View complete booking information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" disabled>
                          <span className="flex items-center">
                            View Details
                            <Info className="ml-1 h-3 w-3" />
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You can only view details of your own bookings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {booking.status === "pending" && onCancelClick && (
                  <Button
                    variant="outline"
                    onClick={() => onCancelClick(booking._id)}
                  >
                    Cancel
                  </Button>
                )}
                {booking.status === "confirmed" && (
                  <Button variant="outline">Reschedule</Button>
                )}
              </>
            )}

            {type === "past" && booking.status === "completed" && (
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to={`/marketplace/service/${serviceId}`}>Book Again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/marketplace/service/${serviceId}`}>View Service</Link>
                </Button>
              </div>
            )}

            {type === "cancelled" && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/marketplace/service/${serviceId}`}>Book Again</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to={`/marketplace/service/${serviceId}`}>View Service</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyBookings;
