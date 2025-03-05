
import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DeadlineDisplayProps {
  date: string | null | undefined;
  label: string;
  showIcon?: boolean;
  className?: string;
}

const DeadlineDisplay: React.FC<DeadlineDisplayProps> = ({ 
  date, 
  label, 
  showIcon = true,
  className = '' 
}) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    
    const deadline = new Date(dateString);
    return deadline.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isOverdue = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const today = new Date();
    return deadline < today;
  };
  
  const isPending = !!date;
  const overdue = isOverdue(date);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className} ${overdue ? 'text-destructive' : ''}`}>
            {showIcon && <CalendarClock className="h-4 w-4" />}
            <span className="text-sm">
              {label}: {formatDate(date)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isPending 
            ? (overdue 
                ? 'This deadline has passed' 
                : 'Upcoming deadline') 
            : 'No deadline set'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DeadlineDisplay;
