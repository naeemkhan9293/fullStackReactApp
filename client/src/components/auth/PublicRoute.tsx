import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { selectIsAuthenticated, selectIsLoading } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

/**
 * PublicRoute component
 * 
 * This component is used to protect public routes like login and signup.
 * If the user is already authenticated, they will be redirected to the dashboard.
 */
const PublicRoute = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  
  // If we have a token, try to get the current user
  const { isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Show loading spinner while checking authentication
  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    // Get the redirect path from location state or default to dashboard
    const to = location.state?.from?.pathname || "/user/dashboard";
    return <Navigate to={to} replace />;
  }

  // If not authenticated, render the public content
  return <Outlet />;
};

export default PublicRoute;
