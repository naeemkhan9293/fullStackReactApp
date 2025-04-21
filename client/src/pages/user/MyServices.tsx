import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { useGetUserServicesQuery, useUpdateServiceStatusMutation } from "@/store/api/serviceApi";

const MyServices = () => {
  const { data: servicesData, isLoading, isError, refetch } = useGetUserServicesQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateServiceStatusMutation();

  // Handle status update
  const handleStatusUpdate = async (id: string, newStatus: 'active' | 'draft' | 'paused') => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(`Service ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'moved to drafts'}`);
      refetch();
    } catch (error: any) {
      toast.error('Failed to update service status', {
        description: error.data?.error || 'An error occurred. Please try again.'
      });
    }
  };

  // Filter services by status
  const activeServices = servicesData?.data.filter(service => service.status === 'active') || [];
  const draftServices = servicesData?.data.filter(service => service.status === 'draft') || [];
  const pausedServices = servicesData?.data.filter(service => service.status === 'paused') || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your services...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full text-center">
          <h2 className="text-red-600 font-semibold mb-2">Error Loading Services</h2>
          <p className="text-muted-foreground mb-4">We couldn't load your services. Please try again.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Services</h1>
        <Button asChild>
          <Link to="/user/create-service">Create New Service</Link>
        </Button>
      </div>

      {servicesData?.data.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No Services Yet</h2>
          <p className="text-muted-foreground mb-6">You haven't created any services yet. Get started by creating your first service.</p>
          <Button asChild>
            <Link to="/user/create-service">Create Your First Service</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active ({activeServices.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({draftServices.length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({pausedServices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeServices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">You don't have any active services.</p>
            ) : (
              activeServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onStatusChange={handleStatusUpdate}
                  isUpdating={isUpdating}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {draftServices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">You don't have any draft services.</p>
            ) : (
              draftServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onStatusChange={handleStatusUpdate}
                  isUpdating={isUpdating}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            {pausedServices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">You don't have any paused services.</p>
            ) : (
              pausedServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onStatusChange={handleStatusUpdate}
                  isUpdating={isUpdating}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: any;
  onStatusChange: (id: string, status: 'active' | 'draft' | 'paused') => void;
  isUpdating: boolean;
}

const ServiceCard = ({ service, onStatusChange, isUpdating }: ServiceCardProps) => {
  // Format price display
  const priceDisplay = `From $${service.basePrice}`;

  // Get image or icon
  const hasImage = service.images && service.images.length > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center overflow-hidden">
              {hasImage ? (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : service.icon && Icons[service.icon as keyof typeof Icons] ? (
                <div className="text-primary">
                  {React.createElement(Icons[service.icon as keyof typeof Icons], { size: 48 })}
                </div>
              ) : (
                <Icons.service size={48} className="text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="w-full md:w-3/4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-bold">{service.name}</h2>
                <p className="text-sm text-muted-foreground">{service.category} • {priceDisplay}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <Badge variant={service.status === "active" ? "default" : "outline"}>
                  {service.status === "active" ? "Active" : service.status === "draft" ? "Draft" : "Paused"}
                </Badge>
              </div>
            </div>

            <p>{service.description}</p>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Views:</span> {service.views || 0}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Bookings:</span> {service.bookings || 0}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/marketplace/service/${service._id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/user/edit-service/${service._id}`}>Edit</Link>
                </Button>
                {service.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(service._id, 'paused')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Pause
                  </Button>
                ) : service.status === "paused" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(service._id, 'active')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(service._id, 'active')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyServices;
