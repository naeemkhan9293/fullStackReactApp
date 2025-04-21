import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateServiceMutation } from "@/store/api/serviceApi";
import { uploadServiceImage, clearServiceImage, selectUploadState } from "@/store/slices/uploadSlice";

const CreateService = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createService, { isLoading }] = useCreateServiceMutation();
  const uploadState = useSelector(selectUploadState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [serviceOptions, setServiceOptions] = useState([
    { name: "", description: "", price: "" }
  ]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Image upload state
  const isUploading = uploadState.isLoading;
  const serviceImage = uploadState.serviceImage;
  const uploadError = uploadState.error;

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
    dispatch(uploadServiceImage(file));
  };

  const removeImage = () => {
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

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      // Format the data for the API
      const serviceData = {
        name: serviceName,
        category,
        description,
        basePrice: parseFloat(basePrice),
        options: serviceOptions.map(option => ({
          name: option.name,
          description: option.description,
          price: parseFloat(option.price)
        })),
        // Add image if available
        images: serviceImage ? [serviceImage] : undefined
      };

      // Call the API
      const result = await createService(serviceData).unwrap();

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
      toast.error("Failed to create service", {
        description: error.data?.error || "An error occurred while creating your service. Please try again."
      });
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`min-h-[120px] ${formErrors.description ? "border-red-500" : ""}`}
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
              <Button type="submit" disabled={isLoading || isUploading}>
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

            {/* Display form errors */}
            {Object.keys(formErrors).length > 0 && (
              <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-md">
                <h4 className="text-red-700 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="list-disc pl-5 text-red-600 text-sm">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateService;
