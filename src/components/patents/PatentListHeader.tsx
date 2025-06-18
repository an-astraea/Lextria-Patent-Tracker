
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PatentListHeaderProps {
  userRole?: string;
}

const PatentListHeader: React.FC<PatentListHeaderProps> = ({ userRole }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patents</h1>
        <p className="text-muted-foreground">
          Manage and track patent applications
        </p>
      </div>
      
      {(userRole === 'admin' || userRole === 'drafter') && (
        <Link to="/patents/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patent
          </Button>
        </Link>
      )}
    </div>
  );
};

export default PatentListHeader;
