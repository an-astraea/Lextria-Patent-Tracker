
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Loader2,
  Edit,
  Check,
  X
} from 'lucide-react';
import { Patent } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

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
  const [notesContent, setNotesContent] = useState<string>(patent.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Update notes content when patent changes or on initial load
    if (initialLoad || (patent.notes !== notesContent && !isSaving)) {
      setNotesContent(patent.notes || '');
      setInitialLoad(false);
      setIsEditing(false); // Reset editing mode when patent data changes
    }
  }, [patent.notes, initialLoad]);

  const handleSaveNotes = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patents')
        .update({ notes: notesContent })
        .eq('id', patent.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Notes saved successfully',
      });
      
      await refreshPatentData();
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotesContent(patent.notes || '');
    setIsEditing(false);
  };

  // Function to convert text with URLs to clickable links
  const renderContentWithLinks = (content: string) => {
    if (!content) return null;

    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split content by URLs
    const parts = content.split(urlRegex);
    
    // Find all URLs in content
    const urls = content.match(urlRegex) || [];
    
    // Create an array where text and URL components alternate
    const result = [];
    let urlIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      // Add text part
      if (parts[i]) {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
      
      // Add URL part if available
      if (urls[urlIndex]) {
        result.push(
          <a 
            href={urls[urlIndex]} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={`url-${i}`} 
            className="text-blue-500 hover:underline"
          >
            {urls[urlIndex]}
          </a>
        );
        urlIndex++;
      }
    }
    
    return (
      <div className="whitespace-pre-wrap">
        {result}
      </div>
    );
  };

  const canEdit = userRole === 'admin' || userRole === 'drafter' || userRole === 'filer';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Shared Notes
        </CardTitle>
        {canEdit && !isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit Notes
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && isEditing ? (
          <>
            <Textarea
              placeholder="Add notes or comments... URLs will be automatically converted to clickable links."
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <ScrollArea className="h-[300px]">
            {notesContent ? (
              <div className="p-2">
                {renderContentWithLinks(notesContent)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>No notes have been added yet</p>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PatentNotes;
