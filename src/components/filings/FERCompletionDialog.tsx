
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FEREntry } from '@/lib/types';
import { format } from 'date-fns';

interface FERCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fer: FEREntry | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const FERCompletionDialog: React.FC<FERCompletionDialogProps> = ({
  open,
  onOpenChange,
  fer,
  onSubmit,
  isSubmitting,
}) => {
  if (!fer) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete FER Filing</DialogTitle>
          <DialogDescription>
            Confirm that you have completed the FER filing
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Patent Title</div>
              <div className="font-semibold">{fer.patent?.patent_title || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Number</div>
              <div className="font-semibold">FER #{fer.fer_number}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Date</div>
              <div className="font-semibold">
                {fer.fer_date ? format(new Date(fer.fer_date), 'PPP') : 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Deadline</div>
              <div className="font-semibold">
                {fer.fer_filer_deadline ? format(new Date(fer.fer_filer_deadline), 'PPP') : 'Not set'}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Complete FER Filing'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FERCompletionDialog;
