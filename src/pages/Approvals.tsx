
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PatentReviewItem from '@/components/approvals/PatentReviewItem';
import RejectReviewDialog from '@/components/approvals/RejectReviewDialog';
import NoReviewsCard from '@/components/approvals/NoReviewsCard';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';

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
    return <LoadingSpinner />;
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
              <PatentReviewItem
                key={patent.id}
                patent={patent}
                reviewType={reviewType}
                isApproving={isApproving}
                formatReviewType={formatReviewType}
                onApprove={handleApprovePatent}
                onReject={(patent, reviewType) => openRejectModal(patent, reviewType)}
              />
            );
          })}
        </div>
      ) : (
        <NoReviewsCard />
      )}

      <RejectReviewDialog
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        selectedPatent={selectedPatent}
        selectedReviewType={selectedReviewType}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        isRejecting={isRejecting}
        onReject={handleRejectPatent}
        onCancel={closeRejectModal}
      />
    </div>
  );
};

export default Approvals;
