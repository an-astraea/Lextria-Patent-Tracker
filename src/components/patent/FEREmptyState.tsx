
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';

interface FEREmptyStateProps {
  userRole?: string;
  onAddFER?: () => void;
}

const FEREmptyState: React.FC<FEREmptyStateProps> = ({ userRole = 'admin', onAddFER = () => {} }) => {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center text-muted-foreground">
          <p>No FER entries have been added yet.</p>
          {userRole === 'admin' && (
            <Button variant="outline" className="mt-4" onClick={onAddFER}>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add FER Entry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FEREmptyState;
