import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { Icons } from "@/components/ui/icons";
import { RootState } from "@/store/store";
import { useGetServiceByIdQuery } from "@/store/api/serviceApi";
import { useCreateBookingMutation } from "@/store/api/bookingApi";

const BookingPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const optionId = searchParams.get("option") || "";
  const navigate = useNavigate();

  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const isCustomer = user?.role === "customer";

  // State for form
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState(user?.address || "");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default time slots
  const defaultTimeSlots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "1:00 PM - 3:00 PM",
    "3:00 PM - 5:00 PM",
  ];

  // Fetch service details
  const {
    data: serviceData,
    isLoading: isServiceLoading,
    isError: isServiceError,
  } = useGetServiceByIdQuery(id);

  // Create booking mutation
  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();

  // Redirect if user is not a customer
  useEffect(() => {
    if (user && !isCustomer) {
      toast.error("Only customers can book services");
      navigate("/marketplace");
    }
  }, [user, isCustomer, navigate]);

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!date) errors.date = "Please select a date";
    if (!timeSlot) errors.timeSlot = "Please select a time slot";
    if (!address.trim()) errors.address = "Please enter a service address";
    if (!selectedOption) errors.option = "Invalid service option";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!service || !selectedOption) return;

    setIsSubmitting(true);

    try {
      const bookingData = {
        service: id,
        serviceOption: selectedOption.name,
        price: selectedOption.price,
        date: date ? date.toISOString() : "",
        timeSlot,
        address,
        notes: notes.trim() || undefined,
      };

      await createBooking(bookingData).unwrap();
      toast.success("Booking submitted successfully!");
      navigate("/user/my-bookings");
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isServiceLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading service details...</p>
      </div>
    );
  }

  // Error state
  if (isServiceError || !serviceData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full text-center">
          <h2 className="text-red-600 font-semibold mb-2">
            Error Loading Service
          </h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load the service details. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const service = serviceData.data;

  // Get the selected service option
  const selectedOption = optionId
    ? service.options.find((option) => option._id === optionId)
    : service.options[0];

  // Get provider name
  const providerName =
    typeof service.provider === "object" && service.provider.name
      ? service.provider.name
      : "Service Provider";

  // Get available time slots
  const availableTimeSlots =
    service.availableTimeSlots && service.availableTimeSlots.length > 0
      ? service.availableTimeSlots
      : defaultTimeSlots;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Service</h1>
        <p className="text-muted-foreground">
          Complete the form below to book {service.name} with {providerName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Please provide the details for your service booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Option */}
                <div className="space-y-2">
                  <Label>Selected Service</Label>
                  {selectedOption ? (
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">
                          {selectedOption.name}
                        </span>
                        <span className="font-bold">
                          ${selectedOption.price}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedOption.description}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-600">
                      <p>
                        No service option selected. Please go back and select a
                        service option.
                      </p>
                      <Button variant="outline" className="mt-2" asChild>
                        <Link to={`/marketplace/service/${id}`}>
                          Back to Service
                        </Link>
                      </Button>
                    </div>
                  )}
                  {formErrors.option && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.option}
                    </p>
                  )}
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          formErrors.date ? "border-red-500" : ""
                        }`}
                      >
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date() || date > addDays(new Date(), 30)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.date && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>

                {/* Time Slot */}
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Select Time Slot</Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger
                      className={formErrors.timeSlot ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((slot:string) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.timeSlot && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.timeSlot}
                    </p>
                  )}
                </div>

                {/* Service Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Service Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter the address where the service should be performed"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={formErrors.address ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or requirements"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/marketplace/service/${id}`}>Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      isSubmitting || isCreatingBooking || !selectedOption
                    }
                  >
                    {(isSubmitting || isCreatingBooking) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Service Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.images && service.images.length > 0 ? (
                <div className="w-full h-32 rounded-md overflow-hidden">
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : service.icon && Icons[service.icon as keyof typeof Icons] ? (
                <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center">
                  <div className="text-primary">
                    {React.createElement(
                      Icons[service.icon as keyof typeof Icons],
                      { size: 48 }
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center">
                  <Icons.service size={48} className="text-muted-foreground" />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  by {providerName}
                </p>
              </div>

              {selectedOption && (
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Service Fee</span>
                    <span>${selectedOption.price}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedOption.price}</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Payment will be collected after the service is completed.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
