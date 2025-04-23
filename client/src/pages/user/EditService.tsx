import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetServiceByIdQuery, useUpdateServiceMutation } from "@/store/api/serviceApi";
import { uploadServiceImage, clearServiceImage, selectUploadState } from "@/store/slices/uploadSlice";

const EditService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: serviceData, isLoading: isLoadingService } = useGetServiceByIdQuery(id || "");
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const uploadState = useSelector(selectUploadState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [serviceOptions, setServiceOptions] = useState<Array<{ name: string; description: string; price: string; _id?: string }>>([
    { name: "", description: "", price: "" }
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Image upload state
  const isUploading = uploadState.isLoading;
  const serviceImage = uploadState.serviceImage;
  const uploadError = uploadState.error;

  // Load service data when available
  useEffect(() => {
    if (serviceData?.data) {
      const service = serviceData.data;
      setServiceName(service.name);
      setCategory(service.category);
      setDescription(service.description);
      setBasePrice(service.basePrice.toString());
      
      // Set service options
      if (service.options && service.options.length > 0) {
        setServiceOptions(
          service.options.map(option => ({
            _id: option._id,
            name: option.name,
            description: option.description,
            price: option.price.toString()
          }))
        );
      } else {
        setServiceOptions([{ name: "", description: "", price: "" }]);
      }

      // Set images
      if (service.images && service.images.length > 0) {
        setImages(service.images);
      }
    }
  }, [serviceData]);

  // Add a new service option
  const addServiceOption = () => {
    setServiceOptions([...serviceOptions, { name: "", description: "", price: "" }]);
  };

  // Update a service option
  const updateServiceOption = (index: number, field: string, value: string) => {
    const updatedOptions = [...serviceOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setServiceOptions(updatedOptions);
  };

  // Remove a service option
  const removeServiceOption = (index: number) => {
    if (serviceOptions.length > 1) {
      const updatedOptions = [...serviceOptions];
      updatedOptions.splice(index, 1);
      setServiceOptions(updatedOptions);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPG, PNG, or WebP image.'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Image must be less than 5MB.'
      });
      return;
    }

    // Upload the image
    // @ts-ignore - Type issue with the thunk action
    dispatch(uploadServiceImage(file));
  };

  const removeImage = (imageUrl: string) => {
    setImages(images.filter(img => img !== imageUrl));
  };

  const removeNewImage = () => {
    dispatch(clearServiceImage());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!serviceName.trim()) {
      errors.serviceName = "Service name is required";
    }

    if (!category) {
      errors.category = "Category is required";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    }

    if (!basePrice || parseFloat(basePrice) <= 0) {
      errors.basePrice = "Base price must be greater than 0";
    }

    // Validate service options
    const optionErrors: string[] = [];
    serviceOptions.forEach((option, index) => {
      if (!option.name.trim()) {
        optionErrors.push(`Option ${index + 1}: Name is required`);
      }
      if (!option.description.trim()) {
        optionErrors.push(`Option ${index + 1}: Description is required`);
      }
      if (!option.price || parseFloat(option.price) <= 0) {
        optionErrors.push(`Option ${index + 1}: Price must be greater than 0`);
      }
    });

    if (optionErrors.length > 0) {
      errors.options = optionErrors.join(', ');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Service ID is missing");
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      // Prepare updated images array
      const updatedImages = [...images];
      if (serviceImage && !images.includes(serviceImage)) {
        updatedImages.push(serviceImage);
      }

      // Format the data for the API
      const updatedServiceData = {
        name: serviceName,
        category,
        description,
        basePrice: parseFloat(basePrice),
        options: serviceOptions.map(option => ({
          ...(option._id ? { _id: option._id } : {}),
          name: option.name,
          description: option.description,
          price: parseFloat(option.price)
        })),
        images: updatedImages
      };

      // Call the API
      await updateService({
        id,
        serviceData: updatedServiceData
      }).unwrap();

      // Show success message
      toast.success("Service updated successfully");

      // Clear the service image from state
      dispatch(clearServiceImage());

      // Navigate to the services page
      navigate("/user/my-services");
    } catch (error: any) {
      console.error('Service update error:', error);
      toast.error("Failed to update service", {
        description: error.data?.error || "An error occurred while updating your service. Please try again."
      });
    }
  };

  if (isLoadingService) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!serviceData?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
        <p className="text-muted-foreground mb-6">The service you're trying to edit doesn't exist or you don't have permission to edit it.</p>
        <Button onClick={() => navigate("/user/my-services")}>Back to My Services</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Service</h1>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>Update information about the service you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Images */}
            <div className="space-y-2 mb-6">
              <Label>Service Images</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Existing images */}
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative h-48 rounded-md overflow-hidden border border-border">
                    <img
                      src={imageUrl}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => removeImage(imageUrl)}
                      disabled={isUploading || isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* New image being uploaded */}
                {serviceImage && !images.includes(serviceImage) && (
                  <div className="relative h-48 rounded-md overflow-hidden border border-border">
                    <img
                      src={serviceImage}
                      alt="New service image"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={removeNewImage}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Add image button */}
                <div
                  onClick={triggerFileInput}
                  className="h-48 rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Add Image</p>
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <p className="text-red-500 text-sm mt-1">Error uploading image: {uploadError}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Home Cleaning, Lawn Mowing, Plumbing Repair"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                  className={formErrors.serviceName ? "border-red-500" : ""}
                />
                {formErrors.serviceName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.serviceName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger
                    id="category"
                    className={formErrors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Pets">Pets</SelectItem>
                    <SelectItem value="Tech">Tech</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className={`min-h-32 ${formErrors.description ? "border-red-500" : ""}`}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Starting Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 50"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                  className={formErrors.basePrice ? "border-red-500" : ""}
                />
                {formErrors.basePrice ? (
                  <p className="text-red-500 text-sm mt-1">{formErrors.basePrice}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">This is the minimum price for your service</p>
                )}
              </div>
            </div>

            {/* Service Options */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Service Options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addServiceOption}>
                  Add Option
                </Button>
              </div>

              {serviceOptions.map((option, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Option {index + 1}</h4>
                      {serviceOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`option-name-${index}`}>Name</Label>
                        <Input
                          id={`option-name-${index}`}
                          placeholder="e.g., Basic Package, Premium Service"
                          value={option.name}
                          onChange={(e) => updateServiceOption(index, "name", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`option-description-${index}`}>Description</Label>
                        <Textarea
                          id={`option-description-${index}`}
                          placeholder="Describe what's included in this option"
                          value={option.description}
                          onChange={(e) => updateServiceOption(index, "description", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`option-price-${index}`}>Price ($)</Label>
                        <Input
                          id={`option-price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 75"
                          value={option.price}
                          onChange={(e) => updateServiceOption(index, "price", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formErrors.options && (
                <p className="text-red-500 text-sm mt-1">{formErrors.options}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/user/my-services")}
                disabled={isUpdating || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating || isUploading}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Update Service"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditService;
