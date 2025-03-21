
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';
import { Timeline, TimelineItem } from '@/lib/types';
import { fetchPatentTimeline } from '@/lib/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PatentTimelineProps {
  patentId: string;
  onAddTimelineClick?: () => void;
}

const PatentTimeline: React.FC<PatentTimelineProps> = ({ patentId, onAddTimelineClick }) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await fetchPatentTimeline(patentId);
      setTimeline(data);
    } catch (error) {
      console.error('Error loading timeline:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patent timeline',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patentId) {
      loadTimeline();
    }
  }, [patentId]);

  // Determine event type color
  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'drafting':
        return 'bg-blue-100 text-blue-800';
      case 'filing':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'approval':
        return 'bg-amber-100 text-amber-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Patent Timeline
        </CardTitle>
        
        {onAddTimelineClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddTimelineClick}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading timeline...</p>
          </div>
        ) : timeline.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-0 bottom-0 left-16 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {/* Date circle */}
                  <div className="relative w-12 flex-shrink-0 text-center">
                    <div className="sticky top-20">
                      <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground z-10 mx-auto">
                        {event.created_at && new Date(event.created_at).getDate()}
                      </div>
                      <div className="text-xs mt-1 font-medium text-muted-foreground">
                        {event.created_at && format(new Date(event.created_at), 'MMM')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Event content */}
                  <div className="bg-card rounded-lg border p-3 shadow-sm flex-1 relative">
                    {/* Event type badge */}
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </Badge>
                      
                      <span className="text-xs text-muted-foreground">
                        {event.created_at && format(new Date(event.created_at), 'h:mm a')}
                      </span>
                    </div>
                    
                    <p className="text-sm">{event.event_description}</p>
                    
                    {event.employee_name && (
                      <div className="mt-2 flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">
                                {event.employee_name.charAt(0)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{event.employee_name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="text-xs text-muted-foreground">{event.employee_name}</span>
                      </div>
                    )}
                    
                    {event.deadline_date && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {format(new Date(event.deadline_date), 'dd MMM yyyy')}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No timeline events yet</p>
            {onAddTimelineClick && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddTimelineClick}
                className="mt-4"
              >
                Add First Timeline Event
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatentTimeline;
