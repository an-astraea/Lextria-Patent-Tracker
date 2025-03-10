
import React from 'react';
import { FEREntry } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';

interface FERDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ferToDelete: FEREntry | null;
  isSubmitting: boolean;
  onConfirmDelete: () => Promise<void>;
}

const FERDeleteDialog: React.FC<FERDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  ferToDelete,
  isSubmitting,
  onConfirmDelete
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the FER entry. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FERDeleteDialog;
