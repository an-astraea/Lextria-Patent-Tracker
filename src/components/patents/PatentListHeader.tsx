
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatentListHeaderProps {
  userRole: string | undefined;
}

const PatentListHeader: React.FC<PatentListHeaderProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Patents</h1>
      {userRole === 'admin' && (
        <Button onClick={() => navigate('/patents/add')} className="sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Patent
        </Button>
      )}
    </div>
  );
};

export default PatentListHeader;
