
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  User, 
  FileEdit, 
  FileText, 
  Download, 
  SendHorizontal, 
  RadioTower, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Badge } from './ui/badge';

export interface TimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestones: any[];
  children?: React.ReactNode; // Added children prop
}

const TimelineDialog: React.FC<TimelineDialogProps> = ({ 
  open, 
  onOpenChange, 
  milestones,
  children 
}) => {
  const getEventIcon = (eventType: string) => {
    if (eventType.includes('draft') || eventType.includes('drafting')) {
      return <FileEdit className="h-4 w-4 text-amber-500" />;
    } else if (eventType.includes('file') || eventType.includes('filing')) {
      return <FileText className="h-4 w-4 text-sky-500" />;
    } else if (eventType.includes('idf') && eventType.includes('received')) {
      return <Download className="h-4 w-4 text-emerald-500" />;
    } else if (eventType.includes('idf') && eventType.includes('sent')) {
      return <SendHorizontal className="h-4 w-4 text-indigo-500" />;
    } else if (eventType.includes('fer')) {
      return <RadioTower className="h-4 w-4 text-blue-600" />;
    } else if (eventType.includes('assigned')) {
      return <User className="h-4 w-4 text-purple-500" />;
    } else if (eventType.includes('completed') || eventType.includes('approved')) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: number) => {
    if (status === undefined) return null;

    if (status === 1) {
      return <Badge variant="success">Completed</Badge>;
    } else if (status === 0) {
      return <Badge variant="outline">Pending</Badge>;
    }
    return null;
  };

  // Ensure milestones is an array
  const milestonesArray = Array.isArray(milestones) ? milestones : [];

  // Sort newest first
  const sortedMilestones = [...milestonesArray].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Patent Timeline</DialogTitle>
          <DialogDescription>
            Complete history of events for this patent
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-4 h-[calc(90vh-160px)]">
          <div className="space-y-4 p-1">
            {sortedMilestones.length > 0 ? (
              sortedMilestones.map((event, index) => (
                <div 
                  key={event.id || index} 
                  className="flex gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 flex items-start pt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">
                        {event.event_type.replace(/_/g, ' ')}
                      </h4>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <p className="text-sm mt-1">{event.event_description}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {event.created_at && (
                        <div className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          <span>{format(new Date(event.created_at), 'PPpp')}</span>
                        </div>
                      )}
                      
                      {event.employee_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{event.employee_name}</span>
                        </div>
                      )}
                      
                      {event.deadline_date && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <CalendarClock className="h-3 w-3" />
                          <span>Due: {format(new Date(event.deadline_date), 'PPp')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No timeline events available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDialog;
