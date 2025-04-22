import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";
import { useGetServicesQuery } from "@/store/api/serviceApi";

const ServiceMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("all");

  // Fetch services from API
  const { data: servicesData, isLoading, isError, refetch } = useGetServicesQuery();

  // Get unique categories from the services
  const categories = servicesData?.data ?
    [...new Set(servicesData.data.map(service => service.category))].sort() :
    [];

  // Filter services based on search term and category
  const filteredServices = servicesData?.data ?
    servicesData.data.filter(service => {
      // Only show active services
      if (service.status !== 'active') return false;

      // Filter by search term
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof service.provider === 'object' && service.provider.name ?
          service.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) :
          false);

      // Filter by category
      const matchesCategory = category === "all" || service.category === category;

      return matchesSearch && matchesCategory;
    }) :
    [];

  // Sort services based on sort option
  const sortedServices = filteredServices ? [...filteredServices].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.basePrice - b.basePrice;
    } else if (sortBy === "price-high") {
      return b.basePrice - a.basePrice;
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    // Default: newest (by creation date)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full text-center">
          <h2 className="text-red-600 font-semibold mb-2">Error Loading Services</h2>
          <p className="text-muted-foreground mb-4">We couldn't load the services. Please try again.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search services or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {sortedServices.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No Services Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm || category !== "all" ?
              "Try adjusting your search or filter criteria." :
              "There are no services available at the moment."}
          </p>
          {(searchTerm || category !== "all") && (
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setCategory("all");
            }}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Service Grid */}
      {sortedServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => {
            // Format provider name
            const providerName = typeof service.provider === 'object' && service.provider.name ?
              service.provider.name : 'Service Provider';

            // Format price display
            const priceDisplay = `From $${service.basePrice}`;

            // Check if service has an image
            const hasImage = service.images && service.images.length > 0;

            return (
              <Card key={service._id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>Provided by {providerName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {hasImage ? (
                      <img
                        src={service.images?.[0] || ''}
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
                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-medium">{priceDisplay}</span>
                    <span className="text-sm text-muted-foreground">
                      Rating: {service.rating}/5
                      {service.reviewCount > 0 && `(${service.reviewCount})`}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/marketplace/service/${service._id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceMarketplace;
