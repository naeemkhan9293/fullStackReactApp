import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateServiceMutation } from "@/store/api/serviceApi";
import { uploadServiceImage, clearServiceImage, selectUploadState } from "@/store/slices/uploadSlice";
import { serviceSchema, ServiceFormValues } from "../../schema/service.schema";

const CreateService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createService, { isLoading }] = useCreateServiceMutation();
  const uploadState = useSelector(selectUploadState);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      images: []
    },
    mode: "onChange"
  });

  // Setup field array for service options
  const { fields, append, remove } = useFieldArray({
    name: "options",
    control: form.control
  });

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

  // Image upload handlers
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

  const removeImage = () => {
    dispatch(clearServiceImage());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      // Format the data for the API
      const serviceData = {
        name: data.name,
        category: data.category,
        description: data.description,
        basePrice: parseFloat(data.basePrice),
        options: data.options.map((option: { name: string; description: string; price: string }) => ({
          name: option.name,
          description: option.description,
          price: parseFloat(option.price)
        })),
        // Add image if available
        images: serviceImage ? [serviceImage] : undefined
      };

      // Call the API
      await createService(serviceData).unwrap();

      // Show success message
      toast.success("Service created successfully", {
        description: "Your service has been listed on the marketplace."
      });

      // Clear the service image from state
      dispatch(clearServiceImage());

      // Navigate to the services page
      navigate("/user/my-services");
    } catch (error: any) {
      console.error('Service creation error:', error);

      // Check if the error is due to insufficient credits
      if (error.data?.error === "Insufficient credits") {
        const requiredCredits = error.data?.requiredCredits || 5;
        const currentCredits = error.data?.currentCredits || 0;

        toast.error("Insufficient credits", {
          description: `You need ${requiredCredits} credits to create a service. You currently have ${currentCredits} credits.`,
          action: {
            label: "Buy Credits",
            onClick: () => navigate(`/subscription/get-credits?required=${requiredCredits}&returnUrl=/user/create-service`)
          }
        });
      } else {
        toast.error("Failed to create service", {
          description: error.data?.error || "An error occurred while creating your service. Please try again."
        });
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Service</h1>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>Provide information about the service you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Service Image */}
              <div className="space-y-2 mb-6">
                <Label>Service Image (Optional)</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />

                {serviceImage ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                    <img
                      src={serviceImage}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={removeImage}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={triggerFileInput}
                    className="w-full h-48 rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG, WebP (max 5MB)</p>
                      </>
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                )}
                <p className="text-sm text-muted-foreground">A high-quality image will help your service stand out</p>
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
                          className="min-h-[120px]"
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
                      <FormLabel htmlFor="basePrice">Starting Price ($)</FormLabel>
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
                  <Button type="button" variant="outline" size="sm" onClick={addServiceOption}>
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
                              <FormLabel htmlFor={`option-name-${index}`}>Name</FormLabel>
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
                              <FormLabel htmlFor={`option-description-${index}`}>Description</FormLabel>
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
                              <FormLabel htmlFor={`option-price-${index}`}>Price ($)</FormLabel>
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
                  disabled={isLoading || isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isUploading || form.formState.isSubmitting}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Create Service"
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

export default CreateService;
