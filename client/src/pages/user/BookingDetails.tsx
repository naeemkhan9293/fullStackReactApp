import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, MapPin, FileText, User, Phone, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import AccessDenied from "@/components/AccessDenied";
import { useGetBookingQuery, useUpdateBookingStatusMutation } from "@/store/api/bookingApi";

const BookingDetails = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch booking details
  const { data: bookingData, isLoading, isError, error, refetch } = useGetBookingQuery(id, {
    // Skip refetching on error to prevent infinite loops with auth errors
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  // Update booking status mutation
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    try {
      await updateBookingStatus({
        id,
        status: { status: 'cancelled' }
      }).unwrap();

      toast.success("Booking cancelled successfully");
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to cancel booking");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  // Error state
  if (isError || !bookingData) {
    // Check if it's an authorization error
    const errorMessage = (error as any)?.data?.error || '';
    const isAuthError = errorMessage.includes("Not authorized") || errorMessage.includes("access this booking");

    if (isAuthError) {
      return (
        <AccessDenied
          message="You don't have permission to view this booking. It may belong to another user."
          backUrl="/user/my-bookings"
          backLabel="Back to My Bookings"
          alternativeUrl="/marketplace"
          alternativeLabel="Browse Services"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m0 0V6m0 0h2m-2 0H9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Booking</h2>
            <p className="text-gray-600 mb-6">We couldn't load the booking details. Please try again.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => refetch()}>Retry</Button>
            <Button variant="outline" asChild>
              <Link to="/user/my-bookings">Back to My Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const booking = bookingData.data;

  // Get service name
  const serviceName = typeof booking.service === 'object' && booking.service.name
    ? booking.service.name
    : 'Service';

  // Get provider details
  const provider = typeof booking.provider === 'object' ? booking.provider : null;
  const providerName = provider?.name || 'Provider';

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="ml-2">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline" className="ml-2">Pending</Badge>;
      case "completed":
        return <Badge variant="secondary" className="ml-2">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="ml-2">Cancelled</Badge>;
      default:
        return null;
    }
  };

  // Check if booking can be cancelled
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  // Check if booking is upcoming
  const isUpcoming = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/user/my-bookings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        {getStatusBadge(booking.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Booking Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{serviceName}</CardTitle>
              <CardDescription>Booking #{booking._id.substring(booking._id.length - 8)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p>{formatDate(booking.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Time Slot</p>
                  <p>{booking.timeSlot}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Service Address</p>
                  <p>{booking.address}</p>
                </div>
              </div>

              {booking.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Additional Notes</p>
                    <p>{booking.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Service Option</p>
                <p className="font-medium">{booking.serviceOption}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-bold text-lg">${booking.price}</p>
              </div>
            </CardFooter>
          </Card>

          {/* Actions */}
          {isUpcoming && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {canCancel && (
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Booking
                    </Button>
                  )}

                  {booking.status === "confirmed" && (
                    <Button variant="outline">
                      Request Reschedule
                    </Button>
                  )}

                  <Button variant="outline" asChild>
                    <Link to={`/marketplace/service/${typeof booking.service === 'object' ? booking.service._id : booking.service}`}>
                      View Service
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Provider Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                {provider?.avatar ? (
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{providerName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{provider?.role || 'Provider'}</p>
                </div>
              </div>

              {provider?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p>{provider.phone}</p>
                  </div>
                </div>
              )}

              {provider?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p>{provider.email}</p>
                  </div>
                </div>
              )}

              <Button className="w-full mt-2" variant="outline" asChild>
                <Link to={`/provider/${provider?._id || (typeof booking.provider === 'string' ? booking.provider : '')}`}>
                  View Provider Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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

export default BookingDetails;
