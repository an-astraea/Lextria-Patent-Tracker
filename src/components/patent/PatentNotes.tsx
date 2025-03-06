
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Patent } from '@/lib/types';
import { updatePatentNotes } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Edit } from 'lucide-react';

interface PatentNotesProps {
  patent: Patent;
  onNotesUpdated: (notes: string) => void;
  canEdit: boolean;
}

const PatentNotes: React.FC<PatentNotesProps> = ({ patent, onNotesUpdated, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(patent.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updatePatentNotes(patent.id, notes);
      if (success) {
        toast.success('Notes updated successfully');
        onNotesUpdated(notes);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setIsSaving(false);
    }
  };

  const convertLinksToAnchors = (text: string) => {
    if (!text) return [];
    
    // Regular expression to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Replace URLs with clickable links
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Notes</CardTitle>
        {canEdit && !isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add notes, links or comments here..."
              className="min-h-[150px]"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNotes(patent.notes || '');
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px] whitespace-pre-wrap">
            {notes ? (
              <div>{convertLinksToAnchors(notes)}</div>
            ) : (
              <p className="text-muted-foreground italic">No notes added yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatentNotes;
