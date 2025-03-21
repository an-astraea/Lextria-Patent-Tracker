
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PatentFormData } from '@/lib/types';
import LoadingState from '@/components/common/LoadingState';

interface ConfirmUploadDialogProps {
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  parsedData: PatentFormData[];
  selectedFile: File | null;
  confirmUpload: () => void;
  isUploading: boolean;
}

const ConfirmUploadDialog: React.FC<ConfirmUploadDialogProps> = ({
  showConfirmDialog,
  setShowConfirmDialog,
  parsedData,
  selectedFile,
  confirmUpload,
  isUploading,
}) => {
  return (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Patent Upload</DialogTitle>
          <DialogDescription>
            You're about to upload {parsedData.length} patents to the system. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Data validation successful
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Upload Summary:</p>
            <ul className="text-sm space-y-1">
              <li>• Total patents: {parsedData.length}</li>
              <li>• Total inventors: {parsedData.reduce((acc, patent) => acc + patent.inventors.length, 0)}</li>
              <li>• File: {selectedFile?.name}</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmUpload} disabled={isUploading}>
            {isUploading ? <LoadingState size="sm" text="Uploading..." /> : "Confirm Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmUploadDialog;
