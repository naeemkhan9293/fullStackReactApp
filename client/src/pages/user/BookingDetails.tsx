import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, MapPin, FileText, User, Phone, Mail, ArrowLeft, CheckCircle, CheckSquare, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import AccessDenied from "@/components/AccessDenied";
import { useGetBookingQuery, useUpdateBookingStatusMutation } from "@/store/api/bookingApi";
import { RootState } from "@/store/store";

const BookingDetails = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const isProvider = user?.role === "provider" || user?.role === "admin";

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

  // Handle booking acceptance
  const handleAcceptBooking = async () => {
    try {
      await updateBookingStatus({
        id,
        status: { status: 'confirmed' }
      }).unwrap();

      toast.success("Booking accepted successfully");
      setAcceptDialogOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to accept booking");
    }
  };

  // Handle marking booking as complete
  const handleCompleteBooking = async () => {
    try {
      await updateBookingStatus({
        id,
        status: { status: 'completed' }
      }).unwrap();

      toast.success("Booking marked as completed");
      setCompleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to mark booking as completed");
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

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 ml-2">Paid</Badge>;
      case "unpaid":
        return <Badge variant="outline" className="border-orange-200 text-orange-700 ml-2">Unpaid</Badge>;
      case "processing":
        return <Badge variant="outline" className="border-blue-200 text-blue-700 ml-2">Processing</Badge>;
      case "refunded":
        return <Badge variant="outline" className="border-purple-200 text-purple-700 ml-2">Refunded</Badge>;
      case "failed":
        return <Badge variant="destructive" className="ml-2">Payment Failed</Badge>;
      default:
        return null;
    }
  };

  // Check if booking can be cancelled
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  // Check if booking can be accepted (only pending bookings can be accepted by providers)
  const canAccept = isProvider && booking.status === "pending";

  // Check if booking can be marked as complete (only confirmed bookings can be marked as complete by providers)
  const canComplete = isProvider && booking.status === "confirmed";

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
        <div className="flex items-center">
          {getStatusBadge(booking.status)}
          {getPaymentStatusBadge(booking.paymentStatus)}
        </div>
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

          {/* Payment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Payment Status</p>
                  <div className="flex items-center mt-1">
                    {getPaymentStatusBadge(booking.paymentStatus)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">Amount</p>
                  <p className="text-lg font-bold">${booking.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment actions for customer */}
              {!isProvider && booking.paymentStatus === 'unpaid' && (
                <div className="mt-4">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => navigate(`/marketplace/payment/${booking._id}`)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Your payment is secure and will be held until the service is completed.
                  </p>
                </div>
              )}

              {booking.paymentStatus === 'processing' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                    <p className="text-blue-700 text-sm">Your payment is being processed.</p>
                  </div>
                </div>
              )}

              {booking.paymentStatus === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">Payment failed. Please try again.</p>
                  </div>
                  {!isProvider && (
                    <Button
                      className="w-full mt-2 bg-red-600 hover:bg-red-700"
                      onClick={() => navigate(`/marketplace/payment/${booking._id}`)}
                    >
                      Retry Payment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {isUpcoming && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {/* Provider-specific actions */}
                  {isProvider && (
                    <>
                      {canAccept && (
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setAcceptDialogOpen(true)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept Booking
                        </Button>
                      )}
                      {canComplete && booking.paymentStatus === 'paid' && (
                        <Button
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => setCompleteDialogOpen(true)}
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}
                      {canComplete && booking.paymentStatus !== 'paid' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 w-full">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                            <p className="text-yellow-700 text-sm">
                              Waiting for customer payment before service can be completed.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Customer-specific actions */}
                  {!isProvider && (
                    <>
                      {canCancel && booking.paymentStatus !== 'paid' && (
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
                    </>
                  )}

                  {/* Common actions */}
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
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{providerName}</p>
                  <p className="text-sm text-muted-foreground capitalize">Provider</p>
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

      {/* Accept Booking Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this booking? This will confirm the appointment with the customer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
            <Button
              variant="default"
              onClick={handleAcceptBooking}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Accept Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Booking Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Booking as Complete</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this booking as complete? This indicates that the service has been delivered successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="default"
              onClick={handleCompleteBooking}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetails;
