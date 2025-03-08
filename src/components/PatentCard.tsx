
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { CalendarIcon, User2Icon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PatentCardProps {
  patent: Patent;
  onSelect?: () => void;
  isSelected?: boolean;
}

const PatentCard: React.FC<PatentCardProps> = ({ 
  patent, 
  onSelect,
  isSelected = false
}) => {
  const getStageStatus = (): { stage: string; status: string } => {
    if (patent.ps_filing_status === 0) {
      return { stage: 'PS', status: 'Filing Pending' };
    } else if (patent.cs_filing_status === 0) {
      return { stage: 'CS', status: 'Filing Pending' };
    } else if (patent.fer_status === 1 && patent.fer_filing_status === 0) {
      return { stage: 'FER', status: 'Filing Pending' };
    } else if (patent.ps_completion_status === 1 && patent.cs_completion_status === 1) {
      return { stage: 'Complete', status: 'Completed' };
    } else {
      return { stage: 'Processing', status: 'In Progress' };
    }
  };

  const { stage, status } = getStageStatus();
  
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/10",
        isSelected && "ring-2 ring-primary border-primary bg-accent/10"
      )} 
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base truncate">{patent.patent_title}</CardTitle>
          <StatusBadge status={status} />
        </div>
        <CardDescription className="text-xs truncate">{patent.patent_applicant}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <User2Icon className="h-3 w-3 opacity-70" />
            <span className="truncate">{patent.client_id}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3 opacity-70" />
            <span>
              {patent.date_of_filing 
                ? format(new Date(patent.date_of_filing), 'dd MMM yyyy')
                : 'No filing date'
              }
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full text-xs text-muted-foreground flex justify-between items-center">
          <span>ID: {patent.tracking_id}</span>
          <span className="font-medium text-foreground">Stage: {stage}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatentCard;
