
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompleteDraftingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  completionField: string | null;
  isCompleting: boolean;
  onConfirm: () => Promise<void>;
}

const CompleteDraftingDialog: React.FC<CompleteDraftingDialogProps> = ({
  isOpen,
  onOpenChange,
  completionField,
  isCompleting,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Task Completion</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark {completionField} as completed? 
            This will submit your work for review by an admin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCompleting}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteDraftingDialog;
