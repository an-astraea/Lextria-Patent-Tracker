
import React from 'react';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RejectReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatent: Patent | null;
  selectedReviewType: string;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  isRejecting: boolean;
  onReject: (patent: Patent, reviewType: string) => void;
  onCancel: () => void;
}

const RejectReviewDialog = ({
  open,
  onOpenChange,
  selectedPatent,
  selectedReviewType,
  rejectReason,
  setRejectReason,
  isRejecting,
  onReject,
  onCancel,
}: RejectReviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Review</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this review.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Input
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => selectedPatent && onReject(selectedPatent, selectedReviewType)}
            disabled={isRejecting}
          >
            {isRejecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Reject Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectReviewDialog;
