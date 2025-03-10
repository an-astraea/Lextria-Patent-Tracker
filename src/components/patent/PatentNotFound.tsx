
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const PatentNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <h2 className="text-xl font-semibold text-center">Patent Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The patent you're looking for could not be found or has been removed from the system.
      </p>
      <Button onClick={() => navigate('/patents')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patents
      </Button>
    </div>
  );
};

export default PatentNotFound;
