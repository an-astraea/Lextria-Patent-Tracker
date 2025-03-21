
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Patent, TimelineEventData } from '@/lib/types';

// Create a timeline API function if it doesn't exist yet
const addTimelineEvent = async (eventData: TimelineEventData): Promise<boolean> => {
  // This is a temporary implementation - should be replaced with actual API call
  console.log('Adding timeline event:', eventData);
  
  // Simulate API call success
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};

interface TimelineDialogProps {
  patent: Patent;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const TimelineDialog: React.FC<TimelineDialogProps> = ({ patent, open, onClose, onSave }) => {
  const [eventType, setEventType] = useState('information');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEventTypeChange = (value: string) => {
    setEventType(value);
  };

  const resetForm = () => {
    setEventType('information');
    setDescription('');
    setDeadlineDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please enter a description for this event');
      return;
    }

    setIsLoading(true);
    try {
      await addTimelineEvent({
        patent_id: patent.id,
        event_type: eventType,
        event_description: description,
        deadline_date: deadlineDate || null,
      });

      toast.success('Timeline event added successfully');
      resetForm();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error adding timeline event:', error);
      toast.error('Failed to add timeline event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Create a new event in the patent timeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={eventType} onValueChange={handleEventTypeChange}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="information">Information</SelectItem>
                <SelectItem value="drafting">Drafting</SelectItem>
                <SelectItem value="filing">Filing</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="client">Client Communication</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details about this event"
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline-date">Deadline Date (Optional)</Label>
            <Input
              id="deadline-date"
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDialog;
