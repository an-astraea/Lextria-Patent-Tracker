
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Patent } from '@/lib/types';
import FormRequirementsList from '@/components/FormRequirementsList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompleteFilingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patent: Patent;
  userRole: string;
  formValues: Record<string, boolean>;
  onUpdateForm: (formName: string, value: boolean) => void;
  completionField: string | null;
  isCompleting: boolean;
  onConfirm: () => Promise<void>;
}

const CompleteFilingDialog: React.FC<CompleteFilingDialogProps> = ({
  isOpen,
  onOpenChange,
  patent,
  userRole,
  formValues,
  onUpdateForm,
  completionField,
  isCompleting,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Complete Filing</DialogTitle>
          <DialogDescription>
            Before completing the {completionField} task, please review and update the form requirements below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <FormRequirementsList 
            patent={patent} 
            userRole={userRole} 
            onUpdate={onUpdateForm}
            formValues={formValues}
          />
        </div>
        
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
                Completing Filing...
              </>
            ) : (
              'Complete Filing'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteFilingDialog;
