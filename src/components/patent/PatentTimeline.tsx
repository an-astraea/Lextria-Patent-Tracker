
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { History, ClipboardList, CalendarClock, User, FileText, Flag, Mail, CheckCircle } from 'lucide-react';
import { TimelineItem } from '@/lib/types';
import { toast } from 'sonner';
import { fetchPatentTimeline } from '@/lib/api/timeline-api';

interface PatentTimelineProps {
  patentId: string;
  onAddTimelineClick: () => void;
}

const PatentTimeline: React.FC<PatentTimelineProps> = ({ patentId, onAddTimelineClick }) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTimeline = async () => {
    if (!patentId) return;
    
    setLoading(true);
    try {
      const timelineData = await fetchPatentTimeline(patentId);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error loading timeline:', error);
      toast.error('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [patentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'drafting':
      case 'ps_drafting_status_change':
      case 'cs_drafting_status_change':
      case 'fer_drafter_status_change':
      case 'ps_draft_completed':
      case 'cs_draft_completed':
      case 'fer_draft_completed':
        return <ClipboardList className="h-4 w-4" />;
      case 'filing':
      case 'ps_filing_status_change':
      case 'cs_filing_status_change':
      case 'fer_filing_status_change':
      case 'ps_filing_completed':
      case 'cs_filing_completed':
      case 'fer_filing_completed':
        return <FileText className="h-4 w-4" />;
      case 'deadline':
      case 'ps_drafter_assigned':
      case 'ps_filer_assigned':
      case 'cs_drafter_assigned':
      case 'cs_filer_assigned':
      case 'fer_drafter_assigned':
      case 'fer_filer_assigned':
        return <CalendarClock className="h-4 w-4" />;
      case 'review':
      case 'ps_review_draft_status':
      case 'cs_review_draft_status':
      case 'fer_review_draft_status':
      case 'ps_review_file_status':
      case 'cs_review_file_status':
      case 'fer_review_file_status':
        return <CheckCircle className="h-4 w-4" />;
      case 'idf_status_change':
      case 'cs_data_status_change':
        return <Mail className="h-4 w-4" />;
      case 'patent_completion_status_change':
      case 'ps_completion_status_change':
      case 'cs_completion_status_change':
      case 'fer_completion_status_change':
        return <Flag className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const formatEventType = (eventType: string) => {
    // Format the event type for display by replacing underscores with spaces and capitalizing words
    return eventType
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Timeline</CardTitle>
        <Button onClick={onAddTimelineClick} size="sm">
          Add Event
        </Button>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">No timeline events yet</p>
            <p className="text-sm text-muted-foreground">
              Add events to track the progress of this patent
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative pl-6">
                {index !== timeline.length - 1 && (
                  <div className="absolute left-[11px] top-[26px] bottom-0 w-[2px] bg-border" />
                )}
                
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background">
                    {getEventIcon(event.event_type)}
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="capitalize">{formatEventType(event.event_type)}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                    </div>
                    
                    <p className="text-sm">{event.event_description}</p>
                    
                    {event.employee_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{event.employee_name}</span>
                      </div>
                    )}

                    {event.deadline_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <CalendarClock className="h-3 w-3" />
                        <span>Deadline: {new Date(event.deadline_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {index !== timeline.length - 1 && <div className="my-4"></div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatentTimeline;
