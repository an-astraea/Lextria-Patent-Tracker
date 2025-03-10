
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PatentCard from '@/components/PatentCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  // Helper function to determine the review type for a patent
  const determineReviewType = (patent: Patent) => {
    if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status !== 1) {
      return 'ps_drafting';
    } else if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status !== 1) {
      return 'cs_drafting';
    } else if (patent.ps_filing_status === 1 && patent.ps_review_file_status !== 1) {
      return 'ps_filing';
    } else if (patent.cs_filing_status === 1 && patent.cs_review_file_status !== 1) {
      return 'cs_filing';
    }
    return '';
  };

  // Helper function to format review type for display
  const formatReviewType = (reviewType: string) => {
    switch (reviewType) {
      case 'ps_drafting': return 'PS Drafting';
      case 'cs_drafting': return 'CS Drafting';
      case 'ps_filing': return 'PS Filing';
      case 'cs_filing': return 'CS Filing';
      default: return 'Unknown';
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patents.map(patent => {
            const reviewType = determineReviewType(patent);
            if (!reviewType) return null; // Skip patents with no pending reviews
            
            return (
              <div key={patent.id} className="relative">
                {/* Show the review type as a badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {formatReviewType(reviewType)}
                  </span>
                </div>
                
                {/* Patent Card */}
                <PatentCard patent={patent} />
                
                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2 justify-between">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/patents/${patent.id}`)}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Patent
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleApprovePatent(patent, reviewType)}
                    disabled={isApproving}
                    className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    {isApproving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  
                  <Button
                    variant="outline" 
                    onClick={() => openRejectModal(patent, reviewType)}
                    disabled={isRejecting}
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {isRejecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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
