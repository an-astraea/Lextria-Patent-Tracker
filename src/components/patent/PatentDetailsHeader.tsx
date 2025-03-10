
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import { Patent } from '@/lib/types';

interface PatentDetailsHeaderProps {
  patent: Patent;
  userRole: string;
  isAssignedDrafter: boolean;
  isAssignedFiler: boolean;
  onCompleteDrafting: () => void;
  onCompleteFiling: () => void;
}

const PatentDetailsHeader: React.FC<PatentDetailsHeaderProps> = ({
  patent,
  userRole,
  isAssignedDrafter,
  isAssignedFiler,
  onCompleteDrafting,
  onCompleteFiling
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/patents')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Patent Details</h1>
      </div>
      
      <div className="flex gap-2">
        {userRole === 'admin' && (
          <Button 
            onClick={() => navigate(`/patents/edit/${patent.id}`)}
            variant="outline"
          >
            Edit Patent
          </Button>
        )}
        
        {isAssignedDrafter && (
          <Button onClick={onCompleteDrafting}>
            <Check className="mr-2 h-4 w-4" /> Complete Drafting
          </Button>
        )}
        
        {isAssignedFiler && (
          <Button onClick={onCompleteFiling}>
            <FileText className="mr-2 h-4 w-4" /> Complete Filing
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatentDetailsHeader;
