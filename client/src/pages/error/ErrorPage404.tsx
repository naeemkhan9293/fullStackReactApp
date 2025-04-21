import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ErrorPage404 = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">Go back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage404;
