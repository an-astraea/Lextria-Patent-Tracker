
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface TimelineEvent {
  id: string;
  event_type: string;
  event_description: string;
  created_at: string;
  [key: string]: any;
}

interface PatentTimelineProps {
  timeline: TimelineEvent[];
}

const PatentTimeline: React.FC<PatentTimelineProps> = ({ timeline }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>History of events for this patent</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ScrollArea className="h-[300px] w-full rounded-md border">
          <Table>
            <TableCaption>A list of events for the patent.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeline.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{format(new Date(event.created_at), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{event.event_type}</TableCell>
                  <TableCell>{event.event_description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PatentTimeline;
