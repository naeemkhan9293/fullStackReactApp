import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, Star, Edit, Trash2, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { RootState } from "@/store/store";
import { useGetServiceByIdQuery } from "@/store/api/serviceApi";
import { useGetReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } from "@/store/api/reviewApi";

const ServiceDetails = () => {
  const { id = "" } = useParams<{ id: string }>();

  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const isProvider = user?.role === "provider" || user?.role === "admin";
  const isCustomer = user?.role === "customer";

  // State for review form
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);

  // Fetch service details
  const { data: serviceData, isLoading: isServiceLoading, isError: isServiceError } = useGetServiceByIdQuery(id);

  // Fetch reviews for this service
  const { data: reviewsData, isLoading: isReviewsLoading, isError: isReviewsError } = useGetReviewsQuery(id);

  // Mutations for creating and deleting reviews
  const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation();
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation();

  // Check if the current user has already reviewed this service
  const userReview = reviewsData?.data.find(review => review.user._id === user?.id);

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      await createReview({
        service: id,
        rating: reviewRating,
        comment: reviewComment
      }).unwrap();

      toast.success("Review submitted successfully");
      setReviewDialogOpen(false);
      setReviewComment("");
      setReviewRating(5);
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

  // Loading state
  if (isServiceLoading || isReviewsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading service details...</p>
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
  const isServiceProvider = user?.id === providerId;

  // Format price display
  const priceDisplay = `From $${service.basePrice}`;

  // Calculate average rating
  const averageRating = service.rating || 0;

  return (
    <div className="space-y-8">
      {/* Service Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {service.category}
            </span>
            <span className="text-sm text-muted-foreground">
              Provided by {providerName}
            </span>
          </div>
          <p className="text-lg mb-6">{service.description}</p>

          {/* Different actions based on user role */}
          <div className="flex flex-wrap gap-3">
            {isCustomer && !isServiceProvider && (
              <Button size="lg" asChild>
                <Link to={`/marketplace/book/${service._id}`}>Book This Service</Link>
              </Button>
            )}

            {isServiceProvider && (
              <Button size="lg" variant="outline" asChild>
                <Link to={`/user/edit-service/${service._id}`}>Edit Service</Link>
              </Button>
            )}

            {user && !isServiceProvider && (
              <Button size="lg" variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
            )}

            <Button size="lg" variant="ghost">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        <Card className="w-full md:w-1/3">
          <CardContent className="p-6">
            {service.images && service.images.length > 0 ? (
              <div className="w-full h-48 rounded-md overflow-hidden mb-4">
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : service.icon && Icons[service.icon as keyof typeof Icons] ? (
              <div className="w-full h-48 rounded-md bg-muted flex items-center justify-center mb-4">
                <div className="text-primary">
                  {React.createElement(Icons[service.icon as keyof typeof Icons], { size: 64 })}
                </div>
              </div>
            ) : (
              <div className="w-full h-48 rounded-md bg-muted flex items-center justify-center mb-4">
                <Icons.service size={64} className="text-muted-foreground" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Starting Price:</span>
                <span>{priceDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Rating:</span>
                <div className="flex items-center">
                  <span>{averageRating.toFixed(1)}/5</span>
                  <span className="text-sm text-muted-foreground ml-1">({service.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{service.status || 'active'}</span>
              </div>
              {service.bookings !== undefined && (
                <div className="flex justify-between">
                  <span className="font-medium">Bookings:</span>
                  <span>{service.bookings}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Options */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Service Options</h2>
        {service.options && service.options.length > 0 ? (
          <div className="space-y-4">
            {service.options.map((option, index) => (
              <Card key={option._id || index}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{option.name}</h3>
                      <p className="text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <span className="text-lg font-bold">${option.price}</span>
                      {isCustomer && !isServiceProvider && (
                        <Button asChild>
                          <Link to={`/marketplace/book/${service._id}?option=${option._id || index}`}>Book</Link>
                        </Button>
                      )}
                      {isServiceProvider && (
                        <Button variant="outline" asChild>
                          <Link to={`/user/edit-service/${service._id}?option=${option._id || index}`}>Edit</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No service options available</p>
              {isServiceProvider && (
                <Button className="mt-4" asChild>
                  <Link to={`/user/edit-service/${service._id}`}>Add Service Options</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Provider Info */}
      {typeof service.provider === 'object' && service.provider && (
        <div>
          <h2 className="text-2xl font-bold mb-4">About the Provider</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {service.provider.avatar ? (
                  <img
                    src={service.provider.avatar}
                    alt={service.provider.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{service.provider.name}</h3>
                  {service.provider.role && (
                    <p className="text-sm text-muted-foreground capitalize">{service.provider.role}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>{service.provider.createdAt ? new Date(service.provider.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Services</p>
                  <p>{service.provider.serviceCount || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p>{service.provider.rating ? `${service.provider.rating}/5` : 'No ratings yet'}</p>
                </div>
              </div>

              {service.provider.bio && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Bio</p>
                  <p>{service.provider.bio}</p>
                </div>
              )}

              <Button variant="outline" asChild>
                <Link to={`/provider/${service.provider._id}`}>View Provider Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {isCustomer && !isServiceProvider && !userReview && (
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>
                    Share your experience with this service. Your feedback helps others make better decisions.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <RadioGroup
                      value={reviewRating.toString()}
                      onValueChange={(value) => setReviewRating(parseInt(value))}
                      className="flex space-x-2"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex items-center space-x-1">
                          <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                          <Label htmlFor={`rating-${rating}`} className="cursor-pointer">{rating}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea
                      id="comment"
                      placeholder="Write your review here..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmitReview} disabled={isCreatingReview}>
                    {isCreatingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Review
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {review.user.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">{review.user.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2">{review.comment}</p>

                  {/* Show edit/delete options if this is the user's review */}
                  {user && user.id === review.user._id && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={isDeletingReview}
                      >
                        {isDeletingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this service!</p>
              {isCustomer && !isServiceProvider && !userReview && (
                <Button onClick={() => setReviewDialogOpen(true)}>
                  Write a Review
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
