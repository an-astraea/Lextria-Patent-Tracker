
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updatePatentNotes } from '@/lib/api';
import { Loader2, PenLine } from 'lucide-react';
import { toast } from 'sonner';

interface PatentNotesProps {
  patentId: string;
  initialNotes: string;
  userRole: string;
  onNotesUpdated?: () => void;
}

// Function to convert URLs in text to anchor tags
const linkifyText = (text: string) => {
  if (!text) return '';
  
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with anchor tags
  return text.split(urlRegex).map((part, i) => {
    // Check if this part is a URL
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    // Return regular text
    return part;
  });
};

const PatentNotes = ({ patentId, initialNotes, userRole, onNotesUpdated }: PatentNotesProps) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isNotesSaving, setIsNotesSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Determine if user can edit notes (admin or drafter)
  const canEditNotes = userRole === 'admin' || userRole === 'drafter';

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    if (!patentId) {
      toast.error('Patent ID is missing');
      return;
    }

    setIsNotesSaving(true);

    try {
      const success = await updatePatentNotes(patentId, notes);

      if (success) {
        toast.success('Notes updated successfully');
        setIsEditMode(false); // Exit edit mode after saving
        if (onNotesUpdated) {
          onNotesUpdated();
        }
      } else {
        toast.error('Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setIsNotesSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotes(initialNotes || ''); // Reset to original notes
    setIsEditMode(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            {canEditNotes ? 'View and manage notes for this patent' : 'View notes for this patent'}
          </CardDescription>
        </div>
        {canEditNotes && !isEditMode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditMode(true)}
          >
            <PenLine className="h-4 w-4 mr-2" /> Edit Notes
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {isEditMode ? (
            // Editable text area in edit mode
            <div className="grid gap-2">
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Type your notes here."
                className=""
                rows={6}
              />
            </div>
          ) : (
            // Linkified read-only view when not in edit mode
            <div className="whitespace-pre-wrap bg-gray-100 p-3 rounded-md min-h-[160px]">
              {notes ? linkifyText(notes) : <span className="text-gray-400">No notes available</span>}
            </div>
          )}
          
          {isEditMode && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveNotes} disabled={isNotesSaving}>
                {isNotesSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Notes'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentNotes;
