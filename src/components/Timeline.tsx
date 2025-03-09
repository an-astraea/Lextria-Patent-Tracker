
import React from 'react';
import { TimelineEvent } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineProps {
  timelineEvents: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ timelineEvents }) => {
  if (!timelineEvents || timelineEvents.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No timeline events available
      </div>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700">
      {timelineEvents.map((event, index) => (
        <li key={event.id || index} className="mb-6 ml-4">
          <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
          <time className="mb-1 text-sm font-normal leading-none text-gray-400">
            {event.created_at ? format(new Date(event.created_at), 'MMM dd, yyyy HH:mm') : 'Date not available'}
          </time>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {event.event_type}
          </h3>
          <p className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
            {event.event_description}
          </p>
          {event.deadline_date && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              Deadline: {format(new Date(event.deadline_date), 'MMM dd, yyyy')}
            </div>
          )}
          {event.employee_name && (
            <div className="text-xs text-gray-500">
              By: {event.employee_name}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
};

export default Timeline;
