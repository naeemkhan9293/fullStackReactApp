import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useGetServiceByIdQuery,
  useUpdateServiceMutation,
} from "@/store/api/serviceApi";
import {
  uploadServiceImage,
  clearServiceImage,
  selectUploadState,
} from "@/store/slices/uploadSlice";
import { serviceSchema, ServiceFormValues } from "@/schema/service.schema";

const EditService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceByIdQuery(id || "");
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const uploadState = useSelector(selectUploadState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);

  // Image upload state
  const isUploading = uploadState.isLoading;
  const serviceImage = uploadState.serviceImage;
  const uploadError = uploadState.error;

  // Initialize form with zod resolver
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      basePrice: "",
      options: [{ name: "", description: "", price: "" }],
      images: [],
    },
    mode: "onChange",
  });

  // Setup field array for service options
  const { fields, append, remove } = useFieldArray({
    name: "options",
    control: form.control,
  });

  // Load service data when available
  useEffect(() => {
    if (serviceData?.data) {
      const service = serviceData.data;
      form.reset({
        name: service.name,
        category: service.category,
        description: service.description,
        basePrice: service.basePrice.toString(),
        options:
          service.options && service.options.length > 0
            ? service.options.map((option) => ({
                _id: option._id,
                name: option.name,
                description: option.description,
                price: option.price.toString(),
              }))
            : [{ name: "", description: "", price: "" }],
      });

      // Set images
      if (service.images && service.images.length > 0) {
        setImages(service.images);
      }
    }
  }, [serviceData, form]);

  // Add a new service option
  const addServiceOption = () => {
    append({ name: "", description: "", price: "" });
  };

  // Remove a service option
  const removeServiceOption = (index: number) => {
    if (fields.length > 1) {
      remove(index);
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
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPG, PNG, or WebP image.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Image must be less than 5MB.",
      });
      return;
    }

    // Upload the image
    // @ts-ignore - Type issue with the thunk action
    dispatch(uploadServiceImage(file));
  };

  const removeImage = (imageUrl: string) => {
    setImages(images.filter((img) => img !== imageUrl));
  };

  const removeNewImage = () => {
    dispatch(clearServiceImage());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const onSubmit = async (data: ServiceFormValues) => {
    if (!id) {
      toast.error("Service ID is missing");
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
        name: data.name,
        category: data.category,
        description: data.description,
        basePrice: parseFloat(data.basePrice),
        options: data.options.map(
          (option: {
            _id?: string;
            name: string;
            description: string;
            price: string;
          }) => ({
            ...(option._id ? { _id: option._id } : {}),
            name: option.name,
            description: option.description,
            price: parseFloat(option.price),
          })
        ),
        images: updatedImages,
      };

      // Call the API
      await updateService({
        id,
        serviceData: updatedServiceData,
      }).unwrap();

      // Show success message
      toast.success("Service updated successfully");

      // Clear the service image from state
      dispatch(clearServiceImage());

      // Navigate to the services page
      navigate("/user/my-services");
    } catch (error: any) {
      console.error("Service update error:", error);
      toast.error("Failed to update service", {
        description:
          error.data?.error ||
          "An error occurred while updating your service. Please try again.",
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
        <p className="text-muted-foreground mb-6">
          The service you're trying to edit doesn't exist or you don't have
          permission to edit it.
        </p>
        <Button onClick={() => navigate("/user/my-services")}>
          Back to My Services
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Service</h1>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Update information about the service you offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div
                      key={index}
                      className="relative h-48 rounded-md overflow-hidden border border-border"
                    >
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
                        <p className="text-sm text-muted-foreground">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Add Image
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <p className="text-red-500 text-sm mt-1">
                    Error uploading image: {uploadError}
                  </p>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Service Name</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="e.g., Home Cleaning, Lawn Mowing, Plumbing Repair"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="category">Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="description">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Describe your service in detail"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="basePrice">
                        Starting Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="basePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is the minimum price for your service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Service Options */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Service Options</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addServiceOption}
                  >
                    Add Option
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Option {index + 1}</h4>
                        {fields.length > 1 && (
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
                        <FormField
                          control={form.control}
                          name={`options.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor={`option-name-${index}`}>
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id={`option-name-${index}`}
                                  placeholder="e.g., Basic Package, Premium Service"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`options.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor={`option-description-${index}`}
                              >
                                Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  id={`option-description-${index}`}
                                  placeholder="Describe what's included in this option"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`options.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor={`option-price-${index}`}>
                                Price ($)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id={`option-price-${index}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="e.g., 75"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <Button
                  type="submit"
                  disabled={
                    isUpdating || isUploading || form.formState.isSubmitting
                  }
                >
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditService;
