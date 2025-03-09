
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  CheckCircle2, 
  User, 
  AlertCircle,
  FileEdit,
  FileText,
  Download,
  SendHorizontal,
  RadioTower,
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimelineEvent {
  id: string;
  event_type: string;
  event_description: string;
  created_at: string;
  status?: number;
  employee_name?: string;
  deadline_date?: string;
  [key: string]: any;
}

export interface PatentTimelineProps {
  patentId: string;
  setTimelineMilestones?: React.Dispatch<React.SetStateAction<any[]>>;
  setShowTimelineDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  timeline?: TimelineEvent[];
}

const PatentTimeline: React.FC<PatentTimelineProps> = ({ 
  patentId, 
  setTimelineMilestones, 
  setShowTimelineDialog,
  timeline = [] 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>(timeline);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        // Mock API call - in a real app, you would fetch from your API
        // const response = await fetchPatentTimeline(patentId);
        // setTimelineData(response);
        
        // For now, use any provided timeline data or empty array
        if (timeline && timeline.length > 0) {
          setTimelineData(timeline);
        }
        
        // If we have setTimelineMilestones as a prop, update it
        if (setTimelineMilestones) {
          setTimelineMilestones(timelineData);
        }
      } catch (error) {
        console.error('Error fetching patent timeline:', error);
        toast({
          title: 'Error',
          description: 'Failed to load timeline events',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [patentId, timeline]);

  // Sort timeline by date (newest first)
  const sortedTimeline = [...timelineData].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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

  const handleShowDetailedTimeline = () => {
    if (setShowTimelineDialog) {
      setShowTimelineDialog(true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Loading timeline events...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>History of events for this patent</CardDescription>
        </div>
        {timelineData.length > 0 && setShowTimelineDialog && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShowDetailedTimeline}
          >
            View Full Timeline
          </Button>
        )}
      </CardHeader>
      <CardContent className="pl-2">
        <ScrollArea className="h-[300px] w-full rounded-md border">
          <Table>
            <TableCaption>A list of events for the patent.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[100px] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTimeline.length > 0 ? (
                sortedTimeline.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {format(new Date(event.created_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.event_type)}
                        <span>{event.event_type.replace(/_/g, ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {event.event_description}
                        
                        {event.employee_name && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <User className="h-3 w-3" />
                            {event.employee_name}
                          </div>
                        )}
                        
                        {event.deadline_date && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                            <CalendarClock className="h-3 w-3" />
                            Due: {format(new Date(event.deadline_date), 'yyyy-MM-dd')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(event.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No timeline events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PatentTimeline;
