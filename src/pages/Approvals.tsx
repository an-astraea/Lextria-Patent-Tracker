import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Approvals = () => {
  const navigate = useNavigate();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [selectedReviewType, setSelectedReviewType] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const reviews = await fetchPendingReviews();
        setPatents(reviews);
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        toast.error('Failed to load pending reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  const handleApprovePatent = async (patent: Patent, reviewType: string) => {
    try {
      setIsApproving(true);
      await approvePatentReview(patent, reviewType);

      toast.success('Patent review approved successfully');
      fetchPendingReviews();
    } catch (error) {
      console.error('Error approving patent review:', error);
      toast.error('Failed to approve patent review');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectPatent = async (patent: Patent, reviewType: string) => {
    if (!rejectReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsRejecting(true);
      // Pass rejectReason as the third parameter
      await rejectPatentReview(patent, reviewType, rejectReason);
      
      toast.success('Patent review rejected successfully');
      fetchPendingReviews();
      setRejectModalOpen(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting patent review:', error);
      toast.error('Failed to reject patent review');
    } finally {
      setIsRejecting(false);
    }
  };

  const openRejectModal = (patent: Patent, reviewType: string) => {
    setSelectedPatent(patent);
    setSelectedReviewType(reviewType);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectReason('');
    setSelectedPatent(null);
    setSelectedReviewType('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading pending reviews...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Pending Reviews</h1>

      {patents.length > 0 ? (
        <Table>
          <TableCaption>List of patents awaiting review</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Patent Title</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Review Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patents.map(patent => {
              let reviewType = '';
              if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status !== 1) {
                reviewType = 'ps_drafting';
              } else if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status !== 1) {
                reviewType = 'cs_drafting';
              } else if (patent.ps_filing_status === 1 && patent.ps_review_file_status !== 1) {
                reviewType = 'ps_filing';
              } else if (patent.cs_filing_status === 1 && patent.cs_review_file_status !== 1) {
                reviewType = 'cs_filing';
              }

              return (
                <TableRow key={patent.id}>
                  <TableCell>{patent.tracking_id}</TableCell>
                  <TableCell>{patent.patent_title}</TableCell>
                  <TableCell>{patent.patent_applicant}</TableCell>
                  <TableCell>
                    {reviewType === 'ps_drafting' && 'PS Drafting'}
                    {reviewType === 'cs_drafting' && 'CS Drafting'}
                    {reviewType === 'ps_filing' && 'PS Filing'}
                    {reviewType === 'cs_filing' && 'CS Filing'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => navigate(`/patents/${patent.id}`)}>
                      View
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleApprovePatent(patent, reviewType)}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectModal(patent, reviewType)}
                      disabled={isRejecting}
                    >
                      {isRejecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-xl font-medium">No pending reviews at this time</p>
            <p className="text-gray-500">Check back later for new submissions</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
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
            <Button variant="secondary" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectPatent(selectedPatent as Patent, selectedReviewType)}
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
    </div>
  );
};

export default Approvals;
