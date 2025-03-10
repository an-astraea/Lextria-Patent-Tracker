
import React, { useState, useEffect } from 'react';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PatentReviewItem from '@/components/approvals/PatentReviewItem';
import RejectReviewDialog from '@/components/approvals/RejectReviewDialog';
import NoReviewsCard from '@/components/approvals/NoReviewsCard';
import LoadingState from '@/components/common/LoadingState';

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
    const loadReviews = async () => {
      try {
        setLoading(true);
        const reviews = await fetchPendingReviews();
        console.log('Fetched pending reviews:', reviews);
        setPatents(reviews);
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        toast.error('Failed to load pending reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const handleApprovePatent = async (patent: Patent, reviewType: string) => {
    try {
      setIsApproving(true);
      await approvePatentReview(patent, reviewType);
      
      // Remove the approved patent from the list
      setPatents(prev => prev.filter(p => 
        p.id !== patent.id || determineReviewType(p) !== reviewType
      ));
      
      toast.success('Patent review approved successfully');
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
      
      // Remove the rejected patent from the list
      setPatents(prev => prev.filter(p => 
        p.id !== patent.id || determineReviewType(p) !== reviewType
      ));
      
      toast.success('Patent review rejected successfully');
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
    } else if (patent.fer_entries && patent.fer_entries.length > 0) {
      // Check if any FER entries need review
      const ferEntries = patent.fer_entries || [];
      for (const fer of ferEntries) {
        if (fer.fer_drafter_status === 1 && fer.fer_review_draft_status !== 1) {
          return `fer_drafting_${fer.id}`;
        } else if (fer.fer_filing_status === 1 && fer.fer_review_file_status !== 1) {
          return `fer_filing_${fer.id}`;
        }
      }
    }
    return '';
  };

  // Helper function to format review type for display
  const formatReviewType = (reviewType: string) => {
    if (reviewType.startsWith('fer_drafting_')) {
      return 'FER Drafting';
    } else if (reviewType.startsWith('fer_filing_')) {
      return 'FER Filing';
    }
    
    switch (reviewType) {
      case 'ps_drafting': return 'PS Drafting';
      case 'cs_drafting': return 'CS Drafting';
      case 'ps_filing': return 'PS Filing';
      case 'cs_filing': return 'CS Filing';
      default: return 'Unknown';
    }
  };

  // Filter patents that have at least one pending review
  const patentsWithPendingReviews = patents.filter(patent => determineReviewType(patent) !== '');

  if (loading) {
    return <LoadingState text="Loading pending reviews..." className="py-20" />;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Pending Reviews</h1>

      {patentsWithPendingReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {patentsWithPendingReviews.map(patent => {
            const reviewType = determineReviewType(patent);
            if (!reviewType) return null; // Skip patents with no pending reviews
            
            return (
              <PatentReviewItem
                key={`${patent.id}-${reviewType}`}
                patent={patent}
                reviewType={reviewType}
                isApproving={isApproving}
                formatReviewType={formatReviewType}
                onApprove={handleApprovePatent}
                onReject={openRejectModal}
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
