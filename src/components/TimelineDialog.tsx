
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Patent } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchPatentTimeline } from '@/lib/api';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  FileEdit, 
  FileText, 
  AlertCircle,
  File,
  User,
  Calendar
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  patent_id: string;
  event_type: string;
  event_description: string;
  created_at: string;
  status: number;
  employee_name?: string;
  deadline_date?: string;
}

interface TimelineDialogProps {
  patent: Patent;
  children: React.ReactNode;
}

const TimelineDialog: React.FC<TimelineDialogProps> = ({ patent, children }) => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTimeline = async () => {
      if (open) {
        setLoading(true);
        try {
          const timelineData = await fetchPatentTimeline(patent.id);
          setEvents(timelineData);
        } catch (error) {
          console.error("Error loading timeline:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTimeline();
  }, [open, patent.id]);

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('created')) {
      return <File className="h-5 w-5 text-blue-500" />;
    } else if (eventType.includes('assigned')) {
      return <User className="h-5 w-5 text-purple-500" />;
    } else if (eventType.includes('deadline')) {
      return <Calendar className="h-5 w-5 text-orange-500" />;
    } else if (eventType.includes('draft_completed') || eventType.includes('filing_completed')) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (eventType.includes('approved')) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    } else if (eventType.includes('draft')) {
      return <FileEdit className="h-5 w-5 text-amber-500" />;
    } else if (eventType.includes('filing') || eventType.includes('file')) {
      return <FileText className="h-5 w-5 text-sky-500" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Timeline: {patent.patent_title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4 pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="relative pl-6">
                  {/* Vertical line */}
                  {index < events.length - 1 && (
                    <div className="absolute left-[10px] top-6 w-0.5 h-full -ml-px bg-border" />
                  )}
                  
                  {/* Event circle */}
                  <div className="absolute left-0 top-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  
                  {/* Event content */}
                  <div className="border rounded-md p-3 shadow-sm">
                    <div className="font-medium">{event.event_description}</div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatEventDate(event.created_at)}
                    </div>
                    
                    {event.deadline_date && (
                      <div className="text-sm mt-1 flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Deadline: {format(new Date(event.deadline_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    
                    {event.status === 1 ? (
                      <div className="text-xs mt-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 w-fit">
                        Completed
                      </div>
                    ) : (
                      <div className="text-xs mt-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 w-fit">
                        Pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No timeline events found.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDialog;
