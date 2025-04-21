import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);

  let errorMessage = "An unexpected error occurred";
  let statusText = "Error";
  let status = "";

  if (isRouteErrorResponse(error)) {
    // Error is a route error
    statusText = error.statusText;
    status = error.status.toString();
    errorMessage = error.data?.message || "Something went wrong";
  } else if (error instanceof Error) {
    // Error is a JavaScript Error object
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // Error is a string
    errorMessage = error;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        {status && <p className="text-2xl mb-2">{status} - {statusText}</p>}
        <p className="text-xl mb-6">Something went wrong.</p>
        <p className="mb-8 text-muted-foreground">{errorMessage}</p>
        <Button asChild>
          <Link to="/">Go back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default ErrorBoundary;
