import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Icons } from "@/components/ui/icons";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { useGetServicesQuery } from "@/store/api/serviceApi";
import { Loader2, Star } from "lucide-react";

const LandingPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch featured services from API
  const { data: servicesData, isLoading, error } = useGetServicesQuery();

  // Get top 4 services with highest rating or bookings
  const featuredServices = React.useMemo(() => {
    if (!servicesData?.data) return [];

    // Sort by rating and bookings and take top 4
    return [...servicesData.data]
      .filter(service => service.status === 'active')
      .sort((a, b) => {
        // First sort by rating
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // If ratings are equal, sort by bookings
        return (b.bookings || 0) - (a.bookings || 0);
      })
      .slice(0, 4);
  }, [servicesData]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to LocalConnect</h1>
        <p className="text-xl mb-8 max-w-2xl">
          The premier marketplace for finding and booking local services. Connect with trusted
          service providers in your area or offer your skills to the community.
        </p>
        {!isAuthenticated && (
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/auth/signup">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth/login">Login</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Featured Services */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Services</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Failed to load services. Please try again later.</p>
          </div>
        ) : featuredServices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <Card key={service._id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    {typeof service.provider === 'object' && service.provider.name
                      ? service.provider.name
                      : 'Service Provider'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {service.images && service.images.length > 0 ? (
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
                  <div className="mt-4 flex justify-between items-center">
                    <p className="font-medium">${service.basePrice.toFixed(2)}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{service.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/marketplace/service/${service._id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-12 bg-muted rounded-xl p-8 my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">1</div>
            <h3 className="text-xl font-bold mb-2">Create an Account</h3>
            <p>Sign up for free and set up your profile as a customer or service provider.</p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">2</div>
            <h3 className="text-xl font-bold mb-2">Browse or List Services</h3>
            <p>Find services you need or offer your professional skills to the community.</p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">3</div>
            <h3 className="text-xl font-bold mb-2">Book and Complete Services</h3>
            <p>Schedule appointments, complete services, and leave reviews.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-xl mb-8">Start connecting with local service providers today.</p>
          <Button size="lg" asChild>
            <Link to="/auth/signup">Sign Up Now</Link>
          </Button>
        </section>
      )}

      {isAuthenticated && (
        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore Services</h2>
          <p className="text-xl mb-8">Find the perfect service provider for your needs.</p>
          <Button size="lg" asChild>
            <Link to="/marketplace">Browse All Services</Link>
          </Button>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
