
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  User, 
  CalendarClock,
} from 'lucide-react';
import { format } from 'date-fns';
import { Patent } from '@/lib/types';

interface Note {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface PatentNotesProps {
  patent: Patent;
  userRole: string;
  refreshPatentData: () => Promise<void>;
}

const PatentNotes: React.FC<PatentNotesProps> = ({ 
  patent, 
  userRole, 
  refreshPatentData 
}) => {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This is placeholder data - in a real app, notes would come from the patent object
  const notes: Note[] = patent.notes || [];

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast({
        title: 'Error',
        description: 'Note content cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would send this to your API
      // await addPatentNote(patent.id, newNote);
      
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
      
      setNewNote('');
      await refreshPatentData();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Notes & Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[250px] pr-4 -mr-4">
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="border rounded-md p-3 bg-muted/50"
                >
                  <div className="text-sm">{note.content}</div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{note.created_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      <span>{format(new Date(note.created_at), 'PPp')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
              <p>No notes have been added yet</p>
            </div>
          )}
        </ScrollArea>

        {(userRole === 'admin' || userRole === 'drafter' || userRole === 'filer') && (
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note or comment..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddNote}
                disabled={isSubmitting || !newNote.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatentNotes;
