
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { History, ClipboardList, CalendarClock, User } from 'lucide-react';
import { TimelineItem } from '@/lib/types';
import { toast } from 'sonner';

// Mock timeline data function since it doesn't exist yet
const fetchPatentTimeline = async (patentId: string): Promise<TimelineItem[]> => {
  // This is a placeholder function - should be replaced with actual API call
  console.log('Fetching timeline for patent:', patentId);
  
  // Return mock data
  return [
    {
      id: '1',
      patent_id: patentId,
      event_type: 'drafting',
      event_description: 'Started drafting the patent application',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      employee_name: 'John Doe'
    },
    {
      id: '2',
      patent_id: patentId,
      event_type: 'filing',
      event_description: 'Filed the patent application',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      employee_name: 'Jane Smith'
    }
  ];
};

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
        return <ClipboardList className="h-4 w-4" />;
      case 'deadline':
        return <CalendarClock className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
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
        {timeline.length === 0 ? (
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
                      <span className="capitalize">{event.event_type}</span>
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
