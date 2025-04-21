import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About LocalConnect</h1>

        <div className="prose prose-lg max-w-none">
          <p className="lead text-xl mb-6">
            LocalConnect is a revolutionary platform where users can find and book local services.
            Our mission is to create a vibrant marketplace connecting skilled service providers with customers in their community.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
          <p>
            Founded in 2023, LocalConnect began as a simple idea: what if we could make it easier for people
            to find trusted local service providers in their community? We've created a platform that connects
            skilled professionals with customers who need their services.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
          <p>
            Users can create an account as either a customer or service provider. Customers can browse
            available services, view provider profiles, and book appointments directly through the platform.
          </p>
          <p>
            Service providers can create detailed listings of their services, set their availability,
            and manage bookings all in one place. Our review system helps build trust and accountability
            in the community.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
          <p>
            LocalConnect is built by a team of passionate developers who believe in the power of
            community and local economies. We're constantly working to improve the platform and add
            new features that make connecting with local service providers even easier.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Join Us</h2>
          <p>
            Whether you're a skilled professional looking to grow your business or someone in need
            of local services, we invite you to join our community and experience the LocalConnect difference.
          </p>

          <div className="flex gap-4 mt-8">
            <Button asChild>
              <Link to="/auth/signup">Sign Up Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">Browse Services</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
