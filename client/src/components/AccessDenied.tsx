import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AccessDeniedProps {
  message?: string;
  backUrl?: string;
  backLabel?: string;
  alternativeUrl?: string;
  alternativeLabel?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = "You don't have permission to access this resource.",
  backUrl = "/",
  backLabel = "Go Back",
  alternativeUrl,
  alternativeLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-md p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m0 0V6m0 0h2m-2 0H9" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" asChild>
            <Link to={backUrl}>{backLabel}</Link>
          </Button>
          {alternativeUrl && alternativeLabel && (
            <Button variant="outline" asChild>
              <Link to={alternativeUrl}>{alternativeLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
