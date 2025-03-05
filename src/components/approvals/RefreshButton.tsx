
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, loading }) => {
  return (
    <Button 
      variant="outline" 
      onClick={onRefresh}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Refreshing...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </>
      )}
    </Button>
  );
};

export default RefreshButton;
