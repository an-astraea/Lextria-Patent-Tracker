
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updatePatentNotes } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PatentNotesProps {
  patentId: string;
  initialNotes: string;
  userRole: string;
  onNotesUpdated?: () => void;
}

const PatentNotes = ({ patentId, initialNotes, userRole, onNotesUpdated }: PatentNotesProps) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isNotesSaving, setIsNotesSaving] = useState(false);
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>
          {canEditNotes ? 'Add or update notes for this patent' : 'View notes for this patent'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Textarea
              id="notes"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Type your notes here."
              readOnly={!canEditNotes}
              className={!canEditNotes ? "bg-gray-100" : ""}
              rows={6}
            />
          </div>
          {canEditNotes && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentNotes;
