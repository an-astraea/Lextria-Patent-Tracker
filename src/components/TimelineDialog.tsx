
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Patent } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Check, FileText, Clock, File, AlertCircle } from 'lucide-react';

interface TimelineDialogProps {
  patent: Patent;
  children: React.ReactNode;
}

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'upcoming' | 'review';
}

const TimelineDialog = ({ patent, children }: TimelineDialogProps) => {
  // Generate timeline events from patent data
  const generateTimelineEvents = (patent: Patent): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Add created event
    if (patent.created_at) {
      events.push({
        date: new Date(patent.created_at),
        title: 'Patent Created',
        description: `Patent ${patent.tracking_id} was created`,
        status: 'completed'
      });
    }

    // PS Drafting events
    if (patent.ps_drafter_assgn) {
      events.push({
        date: new Date(patent.created_at), // Using created_at as assignment date
        title: 'PS Drafting Assigned',
        description: `Assigned to ${patent.ps_drafter_assgn}`,
        status: 'completed'
      });

      if (patent.ps_drafting_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'PS Drafting Completed',
          description: `Completed by ${patent.ps_drafter_assgn}`,
          status: 'completed'
        });
      }

      if (patent.ps_review_draft_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'PS Draft Sent for Review',
          description: 'Waiting for admin approval',
          status: 'review'
        });
      }
    }

    // PS Filing events
    if (patent.ps_filer_assgn) {
      events.push({
        date: new Date(patent.created_at), // Using created_at as assignment date
        title: 'PS Filing Assigned',
        description: `Assigned to ${patent.ps_filer_assgn}`,
        status: patent.ps_drafting_status === 1 ? 'upcoming' : 'pending'
      });

      if (patent.ps_filing_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'PS Filing Completed',
          description: `Completed by ${patent.ps_filer_assgn}`,
          status: 'completed'
        });
      }

      if (patent.ps_review_file_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'PS Filing Sent for Review',
          description: 'Waiting for admin approval',
          status: 'review'
        });
      }
    }

    // CS Drafting events
    if (patent.cs_drafter_assgn) {
      events.push({
        date: new Date(patent.created_at), // Using created_at as assignment date
        title: 'CS Drafting Assigned',
        description: `Assigned to ${patent.cs_drafter_assgn}`,
        status: 'completed'
      });

      if (patent.cs_drafting_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'CS Drafting Completed',
          description: `Completed by ${patent.cs_drafter_assgn}`,
          status: 'completed'
        });
      }

      if (patent.cs_review_draft_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'CS Draft Sent for Review',
          description: 'Waiting for admin approval',
          status: 'review'
        });
      }
    }

    // CS Filing events
    if (patent.cs_filer_assgn) {
      events.push({
        date: new Date(patent.created_at), // Using created_at as assignment date
        title: 'CS Filing Assigned',
        description: `Assigned to ${patent.cs_filer_assgn}`,
        status: patent.cs_drafting_status === 1 ? 'upcoming' : 'pending'
      });

      if (patent.cs_filing_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'CS Filing Completed',
          description: `Completed by ${patent.cs_filer_assgn}`,
          status: 'completed'
        });
      }

      if (patent.cs_review_file_status === 1) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'CS Filing Sent for Review',
          description: 'Waiting for admin approval',
          status: 'review'
        });
      }
    }

    // FER events
    if (patent.fer_status === 1) {
      events.push({
        date: new Date(patent.updated_at || Date.now()),
        title: 'FER Status Activated',
        description: 'Further Examination Report required',
        status: 'completed'
      });

      if (patent.fer_drafter_assgn) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'FER Drafting Assigned',
          description: `Assigned to ${patent.fer_drafter_assgn}`,
          status: 'completed'
        });

        if (patent.fer_drafter_status === 1) {
          events.push({
            date: new Date(patent.updated_at || Date.now()),
            title: 'FER Drafting Completed',
            description: `Completed by ${patent.fer_drafter_assgn}`,
            status: 'completed'
          });
        }

        if (patent.fer_review_draft_status === 1) {
          events.push({
            date: new Date(patent.updated_at || Date.now()),
            title: 'FER Draft Sent for Review',
            description: 'Waiting for admin approval',
            status: 'review'
          });
        }
      }

      if (patent.fer_filer_assgn) {
        events.push({
          date: new Date(patent.updated_at || Date.now()),
          title: 'FER Filing Assigned',
          description: `Assigned to ${patent.fer_filer_assgn}`,
          status: patent.fer_drafter_status === 1 ? 'upcoming' : 'pending'
        });

        if (patent.fer_filing_status === 1) {
          events.push({
            date: new Date(patent.updated_at || Date.now()),
            title: 'FER Filing Completed',
            description: `Completed by ${patent.fer_filer_assgn}`,
            status: 'completed'
          });
        }

        if (patent.fer_review_file_status === 1) {
          events.push({
            date: new Date(patent.updated_at || Date.now()),
            title: 'FER Filing Sent for Review',
            description: 'Waiting for admin approval',
            status: 'review'
          });
        }
      }
    }

    // Completion events
    if (patent.ps_completion_status === 1) {
      events.push({
        date: new Date(patent.updated_at || Date.now()),
        title: 'PS Process Completed',
        description: 'Drafting and filing completed',
        status: 'completed'
      });
    }

    if (patent.cs_completion_status === 1) {
      events.push({
        date: new Date(patent.updated_at || Date.now()),
        title: 'CS Process Completed',
        description: 'Drafting and filing completed',
        status: 'completed'
      });
    }

    if (patent.fer_completion_status === 1) {
      events.push({
        date: new Date(patent.updated_at || Date.now()),
        title: 'FER Process Completed',
        description: 'Drafting and filing completed',
        status: 'completed'
      });
    }

    // Sort events by date (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = generateTimelineEvents(patent);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'upcoming':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Patent Timeline</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-2">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                    {getStatusIcon(event.status)}
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="h-full w-px bg-border mt-1" />
                  )}
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center text-sm font-medium leading-none">
                    {event.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(event.date, 'PPP p')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
            
            {timelineEvents.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
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
