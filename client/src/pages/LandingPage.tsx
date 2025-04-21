import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Icons } from "@/components/ui/icons";

const LandingPage = () => {
  // Sample service data
  const featuredServices = [
    { id: 1, name: "Home Cleaning", icon: "home", price: "From $50", provider: "CleanPro Services" },
    { id: 2, name: "Plumbing Repair", icon: "wrench", price: "From $75", provider: "Quick Fix Plumbing" },
    { id: 3, name: "Lawn Care", icon: "scissors", price: "From $40", provider: "Green Thumb Landscaping" },
    { id: 4, name: "Electrical Work", icon: "zap", price: "From $85", provider: "Reliable Electric" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to LocalConnect</h1>
        <p className="text-xl mb-8 max-w-2xl">
          The premier marketplace for finding and booking local services. Connect with trusted
          service providers in your area or offer your skills to the community.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/auth/signup">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/auth/login">Login</Link>
          </Button>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.provider}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center">
                  {service.icon && Icons[service.icon as keyof typeof Icons] ? (
                    <div className="text-primary">
                      {React.createElement(Icons[service.icon as keyof typeof Icons], { size: 48 })}
                    </div>
                  ) : (
                    <Icons.service size={48} className="text-muted-foreground" />
                  )}
                </div>
                <div className="mt-4">
                  <p className="font-medium">{service.price}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to={`/marketplace/service/${service.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
        <p className="text-xl mb-8">Start connecting with local service providers today.</p>
        <Button size="lg" asChild>
          <Link to="/auth/signup">Sign Up Now</Link>
        </Button>
      </section>
    </div>
  );
};

export default LandingPage;
