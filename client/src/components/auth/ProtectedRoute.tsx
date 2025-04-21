import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { selectIsAuthenticated, selectIsLoading } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

interface ProtectedRouteProps {
  allowedRoles?: ('customer' | 'provider' | 'admin')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  console.log('ProtectedRoute: isAuthenticated', isAuthenticated);
  
  
  // If we have a token, try to get the current user
  const { data, isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  console.log('ProtectedRoute: data', data);

  // Show loading spinner while checking authentication
  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && data?.data?.role) {
    if (!allowedRoles.includes(data.data.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required role, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
