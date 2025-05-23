import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, Star, Trash2, Heart, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RootState } from "@/store/store";
import { useGetServiceByIdQuery } from "@/store/api/serviceApi";
import { useGetReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } from "@/store/api/reviewApi";
import { useGetSavedServicesQuery, useSaveServiceMutation, useRemoveSavedServiceMutation } from "@/store/api/savedServicesApi";

// Variant 2: Side-by-side layout with image on left and details on right
const ServiceDetailsVariant2 = () => {
  const { id = "" } = useParams<{ id: string }>();

  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const isCustomer = user?.role === "customer";

  // State for review form
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Fetch service details
  const { data: serviceData, isLoading: isServiceLoading, isError: isServiceError } = useGetServiceByIdQuery(id);

  // Fetch reviews for this service
  const { data: reviewsData, isError: isReviewsError } = useGetReviewsQuery(id);

  // Fetch saved services
  const { data: savedServicesData } = useGetSavedServicesQuery(undefined, {
    skip: !user,
  });

  // Save/remove service mutations
  const [saveService] = useSaveServiceMutation();
  const [removeSavedService] = useRemoveSavedServiceMutation();

  // Mutations for creating and deleting reviews
  const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation();
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation();

  // Check if the current user has already reviewed this service
  const userReview = reviewsData?.data.find(review =>
    user && (review.user._id === user._id || (user.id && review.user._id === user.id))
  );

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("You must be logged in to leave a review");
      return;
    }

    try {
      await createReview({
        service: id,
        rating: reviewRating,
        comment: reviewComment
      }).unwrap();

      setReviewComment("");
      setReviewRating(5);
      setReviewDialogOpen(false);
      toast.success("Review submitted successfully");
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to submit review");
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        await deleteReview(reviewId).unwrap();
        toast.success("Review deleted successfully");
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to delete review");
      }
    }
  };

  // Handle save/unsave service
  const handleSaveService = async () => {
    if (!user) {
      toast.error("You must be logged in to save services");
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await removeSavedService(id).unwrap();
        toast.success("Service removed from saved list");
      } else {
        await saveService(id).unwrap();
        toast.success("Service saved to your list");
      }
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to update saved services");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if service is saved
  useEffect(() => {
    if (savedServicesData && id) {
      const isSavedService = savedServicesData.data.some(service => service.serviceId === id);
      setIsSaved(isSavedService);
    }
  }, [savedServicesData, id]);

  // Loading state
  if (isServiceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (isServiceError || isReviewsError || !serviceData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full text-center">
          <h2 className="text-red-600 font-semibold mb-2">Error Loading Service</h2>
          <p className="text-muted-foreground mb-4">We couldn't load the service details. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const service = serviceData.data;
  const reviews = reviewsData?.data || [];

  // Format provider name
  const providerName = typeof service.provider === 'object' && service.provider.name ?
    service.provider.name : 'Service Provider';

  // Get provider ID
  const providerId = typeof service.provider === 'object' && service.provider._id ?
    service.provider._id : service.provider;

  // Check if current user is the provider of this service
  const isServiceProvider = user && (user._id === providerId || (user.id && user.id === providerId));

  // Format price display
  const priceDisplay = `From $${service.basePrice}`;

  // Calculate average rating
  const averageRating = service.rating || 0;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Side-by-Side Layout */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left Column - Service Image */}
          <div className="w-full lg:w-1/2 h-[400px] rounded-xl overflow-hidden shadow-md border">
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : service.icon && Icons[service.icon as keyof typeof Icons] ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/5 to-primary/10">
                {React.createElement(Icons[service.icon as keyof typeof Icons], {
                  className: "h-32 w-32 text-primary/40",
                })}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/5 to-primary/10">
                <User className="h-32 w-32 text-primary/40" />
              </div>
            )}
          </div>

          {/* Right Column - Service Details */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20">
                  {service.category}
                </Badge>
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-amber-500" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">({service.reviewCount || 0})</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
              <p className="text-muted-foreground mb-4">
                Provided by <span className="font-medium text-foreground">{providerName}</span>
              </p>
              <p className="text-muted-foreground mb-6">{service.description}</p>
            </div>

            {/* Price Card */}
            <Card className="bg-muted/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting from</p>
                    <p className="text-3xl font-bold text-primary">{priceDisplay}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user && !isServiceProvider && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveService}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        )}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* CTA Button */}
                {isCustomer && !isServiceProvider && (
                  <Button size="lg" className="w-full shadow-sm" asChild>
                    <Link to={`/marketplace/book/${service._id}`}>Book This Service</Link>
                  </Button>
                )}

                {isServiceProvider && (
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link to={`/user/edit-service/${service._id}`}>Edit Service</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Service Steps Navigation */}
        <div className="mb-8">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeStep === 1
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveStep(1)}
            >
              Step 1: Choose Your Service Option
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeStep === 2
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveStep(2)}
            >
              Step 2: About Your Provider
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeStep === 3
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveStep(3)}
            >
              Step 3: Customer Reviews
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-12">
          {/* Step 1: Choose Your Service Option */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.options && service.options.length > 0 ? (
                  service.options.map((option, index) => (
                    <Card key={option._id || index} className="overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{option.name}</h3>
                        <p className="text-muted-foreground mb-4">{option.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">${option.price}</span>
                          {isCustomer && !isServiceProvider && (
                            <Button asChild>
                              <Link to={`/marketplace/book/${service._id}?option=${option._id || index}`}>Select</Link>
                            </Button>
                          )}
                          {isServiceProvider && (
                            <Button variant="outline" asChild>
                              <Link to={`/user/edit-service/${service._id}?option=${option._id || index}`}>Edit</Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full border-dashed border-2 bg-muted/10">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No service options available.</p>
                      {isServiceProvider && (
                        <Button className="mt-4" asChild>
                          <Link to={`/user/edit-service/${service._id}`}>Add Service Options</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Step 2: About Your Provider */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="h-24 w-24">
                      {typeof service.provider === 'object' && service.provider.avatar ? (
                        <AvatarImage src={service.provider.avatar} alt={providerName} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {providerName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-xl font-semibold">{providerName}</h3>
                        <p className="text-muted-foreground">Service Provider</p>
                      </div>

                      <p className="text-muted-foreground">
                        {typeof service.provider === 'object' && service.provider.bio
                          ? service.provider.bio
                          : "This provider has not added a bio yet."}
                      </p>

                      {!isServiceProvider && (
                        <Button variant="outline" asChild>
                          <Link to={`/messages/new?recipient=${providerId}`}>
                            Contact Provider
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Customer Reviews */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-muted-foreground">See what others are saying about this service.</p>
                </div>

                {isCustomer && !isServiceProvider && !userReview && (
                  <Button onClick={() => setReviewDialogOpen(true)}>
                    Write a Review
                  </Button>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review._id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {review.user.avatar ? (
                                <AvatarImage src={review.user.avatar} alt={review.user.name} />
                              ) : (
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.user.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.user.name}</p>
                              <div className="flex items-center text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < review.rating ? "fill-amber-500" : "text-gray-300"}`}
                                  />
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {user && (user._id === review.user._id || (user.id && user.id === review.user._id)) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={isDeletingReview}
                            >
                              {isDeletingReview ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          )}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 bg-muted/10">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <Star className="h-12 w-12 text-muted-foreground/40" />
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this service!</p>
                    </div>
                    {isCustomer && !isServiceProvider && !userReview && (
                      <Button onClick={() => setReviewDialogOpen(true)}>
                        Write a Review
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with this service to help others.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <RadioGroup
                  id="rating"
                  value={reviewRating.toString()}
                  onValueChange={(value) => setReviewRating(parseInt(value))}
                  className="flex"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-1">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} className="sr-only" />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="cursor-pointer rounded-md p-2 hover:bg-muted"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            rating <= reviewRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                          }`}
                        />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this service..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={isCreatingReview || !reviewComment.trim()}>
                {isCreatingReview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ServiceDetailsVariant2;
