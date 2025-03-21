
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeletePatentDialogProps {
  patentToDelete: string | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

const DeletePatentDialog: React.FC<DeletePatentDialogProps> = ({
  patentToDelete,
  onCancel,
  onConfirm
}) => {
  return (
    <AlertDialog open={!!patentToDelete} onOpenChange={() => !patentToDelete && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this patent?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the patent and remove all associated data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => patentToDelete && onConfirm(patentToDelete)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePatentDialog;
