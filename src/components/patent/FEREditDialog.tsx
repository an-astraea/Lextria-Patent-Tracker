
import React from 'react';
import { FEREntry, Employee } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FEREditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFER: FEREntry | null;
  isAddingFER: boolean;
  ferNumber: number;
  ferDrafter: string;
  ferDrafterDeadline: string;
  ferFiler: string;
  ferFilerDeadline: string;
  ferDate: string;
  isSubmitting: boolean;
  drafters: string[];
  filers: string[];
  setFERNumber: (number: number) => void;
  setFERDrafter: (drafter: string) => void;
  setFERDrafterDeadline: (deadline: string) => void;
  setFERFiler: (filer: string) => void;
  setFERFilerDeadline: (deadline: string) => void;
  setFERDate: (date: string) => void;
  onSave: () => Promise<void>;
}

const FEREditDialog: React.FC<FEREditDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedFER,
  isAddingFER,
  ferNumber,
  ferDrafter,
  ferDrafterDeadline,
  ferFiler,
  ferFilerDeadline,
  ferDate,
  isSubmitting,
  drafters,
  filers,
  setFERNumber,
  setFERDrafter,
  setFERDrafterDeadline,
  setFERFiler,
  setFERFilerDeadline,
  setFERDate,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAddingFER ? 'Add FER Entry' : 'Edit FER Entry'}</DialogTitle>
          <DialogDescription>
            {isAddingFER ? 'Create a new FER entry with the required details.' : 'Update the FER entry details.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fer-number">FER Number</Label>
              <Input
                id="fer-number"
                type="number"
                value={ferNumber}
                onChange={(e) => setFERNumber(parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fer-date">FER Date</Label>
              <Input
                id="fer-date"
                type="date"
                value={ferDate}
                onChange={(e) => setFERDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fer-drafter">Drafter</Label>
            <Select value={ferDrafter} onValueChange={setFERDrafter}>
              <SelectTrigger>
                <SelectValue placeholder="Select drafter" />
              </SelectTrigger>
              <SelectContent>
                {drafters.map((drafter) => (
                  <SelectItem key={drafter} value={drafter}>{drafter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fer-drafter-deadline">Drafter Deadline</Label>
            <Input
              id="fer-drafter-deadline"
              type="date"
              value={ferDrafterDeadline}
              onChange={(e) => setFERDrafterDeadline(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fer-filer">Filer</Label>
            <Select value={ferFiler} onValueChange={setFERFiler}>
              <SelectTrigger>
                <SelectValue placeholder="Select filer" />
              </SelectTrigger>
              <SelectContent>
                {filers.map((filer) => (
                  <SelectItem key={filer} value={filer}>{filer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fer-filer-deadline">Filer Deadline</Label>
            <Input
              id="fer-filer-deadline"
              type="date"
              value={ferFilerDeadline}
              onChange={(e) => setFERFilerDeadline(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FEREditDialog;
