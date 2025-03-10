
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      {message}
    </div>
  );
};

export default LoadingSpinner;
