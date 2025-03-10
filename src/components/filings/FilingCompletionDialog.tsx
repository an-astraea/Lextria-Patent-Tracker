
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
import { Patent } from '@/lib/types';
import { format } from 'date-fns';
import FormRequirementsList from '@/components/patent/FormRequirementsList';

interface FilingCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patent: Patent | null;
  formData: Record<string, boolean>;
  onFormChange: (formName: string, value: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  username: string;
}

const FilingCompletionDialog: React.FC<FilingCompletionDialogProps> = ({
  open,
  onOpenChange,
  patent,
  formData,
  onFormChange,
  onSubmit,
  isSubmitting,
  username,
}) => {
  if (!patent) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Complete Filing</DialogTitle>
          <DialogDescription>
            Confirm that you have completed the filing for this patent
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Patent Title</div>
              <div className="font-semibold">{patent.patent_title}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Tracking ID</div>
              <div className="font-semibold">{patent.tracking_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Client</div>
              <div className="font-semibold">{patent.patent_applicant}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Application No</div>
              <div className="font-semibold">{patent.application_no || 'N/A'}</div>
            </div>
          </div>
          
          {patent.cs_filer_assgn === username && patent.cs_filing_status === 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Form Requirements</h3>
              <FormRequirementsList 
                patent={patent} 
                userRole="filer"
                onUpdate={onFormChange}
                formValues={formData}
              />
            </div>
          )}
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
              'Complete Filing'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilingCompletionDialog;
