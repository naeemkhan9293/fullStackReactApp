import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader2 } from "lucide-react";
import { useGetSavedServicesQuery, useRemoveSavedServiceMutation } from "@/store/api/savedServicesApi";
import { toast } from "sonner";

const SavedServicesPage = () => {
  const { data, isLoading, refetch } = useGetSavedServicesQuery();
  const [removeSavedService] = useRemoveSavedServiceMutation();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleRemoveService = async (serviceId: string) => {
    try {
      setRemovingIds(prev => new Set(prev).add(serviceId));
      await removeSavedService(serviceId).unwrap();
      toast.success("Service removed from saved list");
      refetch();
    } catch (error) {
      toast.error("Failed to remove service");
      console.error("Error removing service:", error);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved Services</h1>
        <p className="text-muted-foreground">Services you've saved for later</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">You haven't saved any services yet</p>
            <Button asChild>
              <Link to="/marketplace">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((service) => (
            <Card key={service._id} className="overflow-hidden flex flex-col">
              <div className="relative h-48">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveService(service.serviceId)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  disabled={removingIds.has(service.serviceId)}
                >
                  {removingIds.has(service.serviceId) ? (
                    <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                  ) : (
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  )}
                </button>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Provider: {service.providerName}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{service.rating.toFixed(1)}</span>
                  </div>
                  <p className="font-bold">${service.price}</p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to={`/marketplace/service/${service.serviceId}`}>View Details</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to={`/marketplace/service/${service.serviceId}/book`}>Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedServicesPage;
