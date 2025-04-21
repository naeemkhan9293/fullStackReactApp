import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-lg mb-8">
        You don't have permission to access this page.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/">Go to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/auth/login">Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
