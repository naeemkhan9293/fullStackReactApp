// Component imports
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Heart } from "lucide-react";

const SavedServices = () => {
  // Mock data for saved services
  const savedServices = [
    {
      id: 1,
      name: "Home Cleaning",
      provider: "CleanPro Services",
      price: "$75",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    {
      id: 2,
      name: "Lawn Mowing",
      provider: "Green Thumb Landscaping",
      price: "$45",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1589428473850-9899cd5ca862?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    {
      id: 3,
      name: "Plumbing Repair",
      provider: "Quick Fix Plumbing",
      price: "$120",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80",
    },
    {
      id: 4,
      name: "Furniture Assembly",
      provider: "Assembly Experts",
      price: "$85",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
    {
      id: 5,
      name: "Computer Repair",
      provider: "Tech Wizards",
      price: "$60",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved Services</h1>
        <p className="text-muted-foreground">Services you've saved for later</p>
      </div>

      {savedServices.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No Saved Services</h2>
          <p className="text-muted-foreground mb-6">You haven't saved any services yet.</p>
          <Button asChild>
            <Link to="/marketplace">Browse Services</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 rounded-full h-8 w-8"
                >
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </Button>
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{service.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Provider: {service.provider}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm">{service.rating}</span>
                  </div>
                  <p className="font-bold">{service.price}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link to={`/marketplace/service/${service.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" className="flex-1">Book Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedServices;
