
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { PatientTimeline } from '@/lib/types';

interface PatentTimelineProps {
  patentId: string;
}

const PatentTimeline: React.FC<PatentTimelineProps> = ({ patentId }) => {
  const [events, setEvents] = useState<PatientTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimelineEvents = async () => {
      try {
        // In a real implementation, this would fetch from an API
        // For now, we'll use mock data
        const mockEvents: PatientTimeline[] = [
          {
            id: '1',
            patent_id: patentId,
            event_type: 'patent_created',
            event_description: 'Patent created',
            created_at: new Date().toISOString(),
            status: 1
          },
          {
            id: '2',
            patent_id: patentId,
            event_type: 'ps_drafter_assigned',
            event_description: 'PS Drafter assigned',
            created_at: new Date().toISOString(),
            status: 1,
            employee_name: 'John Doe',
            deadline_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (patentId) {
      fetchTimelineEvents();
    }
  }, [patentId]);

  const getEventBadge = (eventType: string) => {
    if (eventType.includes('_approved')) {
      return <Badge variant="secondary">Approved</Badge>;
    }
    if (eventType.includes('_assigned')) {
      return <Badge variant="outline">Assigned</Badge>;
    }
    if (eventType.includes('_completed')) {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (eventType.includes('_created')) {
      return <Badge variant="outline">Created</Badge>;
    }
    return <Badge variant="outline">Event</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patent Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading timeline...</div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-6">
                {index < events.length - 1 && (
                  <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="flex flex-col">
                  <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary" />
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium">{event.event_description}</h4>
                    {getEventBadge(event.event_type)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.created_at)}
                  </p>
                  {event.employee_name && (
                    <p className="text-xs mt-1">
                      <span className="font-medium">Assigned to:</span> {event.employee_name}
                    </p>
                  )}
                  {event.deadline_date && (
                    <p className="text-xs">
                      <span className="font-medium">Deadline:</span> {formatDate(event.deadline_date)}
                    </p>
                  )}
                </div>
                {index < events.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No timeline events available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatentTimeline;
