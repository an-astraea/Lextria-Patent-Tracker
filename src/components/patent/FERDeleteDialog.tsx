
import React from 'react';
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
  open?: boolean; // For backward compatibility
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void; // For backward compatibility
  ferToDelete?: any;
  ferNumber: number;
  isSubmitting?: boolean;
  onConfirmDelete?: () => Promise<void>;
  onConfirm?: () => Promise<void>; // For backward compatibility
}

const FERDeleteDialog: React.FC<FERDeleteDialogProps> = ({
  isOpen,
  open,
  onOpenChange,
  onClose,
  ferNumber,
  isSubmitting = false,
  onConfirmDelete,
  onConfirm
}) => {
  // Use either the new or old prop pattern
  const dialogOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || (onClose ? (isOpen) => !isOpen && onClose() : undefined);
  const handleConfirm = async () => {
    if (onConfirmDelete) {
      await onConfirmDelete();
    } else if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the FER entry #{ferNumber}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
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
