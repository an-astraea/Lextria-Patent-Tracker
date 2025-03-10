
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import PendingReviewCard, { ReviewType, getPendingReviewTypes } from '@/components/approvals/PendingReviewCard';
import RefreshButton from '@/components/approvals/RefreshButton';
import EmptyApprovals from '@/components/approvals/EmptyApprovals';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useIsMobile } from '@/hooks/use-mobile';

const ITEMS_PER_PAGE = 6; // Number of items to show per page

const Approvals = () => {
  const navigate = useNavigate();
  const [pendingReviews, setPendingReviews] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingReview, setProcessingReview] = useState<{ patentId: string, type: ReviewType } | null>(null);
  const isMobile = useIsMobile();

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load data only once on initial mount
  useEffect(() => {
    if (user && user.role === 'admin' && !initialLoadDone) {
      loadReviews();
      setInitialLoadDone(true);
    }
  }, [user, initialLoadDone]);

  const loadReviews = async () => {
    if (user && user.role === 'admin') {
      try {
        setLoading(true);
        const reviews = await fetchPendingReviews();
        setPendingReviews(reviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        toast.error('Failed to load pending reviews');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApprove = async (patent: Patent, reviewType: ReviewType) => {
    try {
      setProcessingReview({ patentId: patent.id, type: reviewType });
      const success = await approvePatentReview(patent, reviewType);
      if (success) {
        toast.success('Review approved successfully');
        
        // Optimistic UI update - Remove the approved review from the list
        setPendingReviews(prevReviews => {
          const updatedReviews = [...prevReviews];
          // If this is the last review for this patent, remove the patent
          const reviewsForPatent = getPendingReviewTypes(patent);
          if (reviewsForPatent.length <= 1) {
            return updatedReviews.filter(p => p.id !== patent.id);
          }
          
          // Otherwise, keep the patent but update its review status
          return updatedReviews.map(p => {
            if (p.id === patent.id) {
              const updatedPatent = { ...p };
              switch(reviewType) {
                case 'ps_draft': updatedPatent.ps_review_draft_status = 0; break;
                case 'ps_file': updatedPatent.ps_review_file_status = 0; break;
                case 'cs_draft': updatedPatent.cs_review_draft_status = 0; break;
                case 'cs_file': updatedPatent.cs_review_file_status = 0; break;
                case 'fer_draft': updatedPatent.fer_review_draft_status = 0; break;
                case 'fer_file': updatedPatent.fer_review_file_status = 0; break;
              }
              return updatedPatent;
            }
            return p;
          });
        });
        
        // Dispatch custom event to notify other components about the approval
        const approvalEvent = new CustomEvent('approval-complete');
        window.dispatchEvent(approvalEvent);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    } finally {
      setProcessingReview(null);
    }
  };

  const handleReject = async (patent: Patent, reviewType: ReviewType) => {
    try {
      setProcessingReview({ patentId: patent.id, type: reviewType });
      const success = await rejectPatentReview(patent, reviewType);
      if (success) {
        toast.success('Review rejected and sent back to assignee');
        
        // Optimistic UI update - Remove the rejected review from the list
        setPendingReviews(prevReviews => {
          const updatedReviews = [...prevReviews];
          // If this is the last review for this patent, remove the patent
          const reviewsForPatent = getPendingReviewTypes(patent);
          if (reviewsForPatent.length <= 1) {
            return updatedReviews.filter(p => p.id !== patent.id);
          }
          
          // Otherwise, keep the patent but update its review status
          return updatedReviews.map(p => {
            if (p.id === patent.id) {
              const updatedPatent = { ...p };
              switch(reviewType) {
                case 'ps_draft': updatedPatent.ps_review_draft_status = 0; break;
                case 'ps_file': updatedPatent.ps_review_file_status = 0; break;
                case 'cs_draft': updatedPatent.cs_review_draft_status = 0; break;
                case 'cs_file': updatedPatent.cs_review_file_status = 0; break;
                case 'fer_draft': updatedPatent.fer_review_draft_status = 0; break;
                case 'fer_file': updatedPatent.fer_review_file_status = 0; break;
              }
              return updatedPatent;
            }
            return p;
          });
        });
        
        // Dispatch custom event to notify other components about the rejection
        const rejectionEvent = new CustomEvent('rejection-complete');
        window.dispatchEvent(rejectionEvent);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    } finally {
      setProcessingReview(null);
    }
  };

  const handleRefresh = () => {
    loadReviews();
  };

  // Pagination logic
  const totalPages = Math.ceil(pendingReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = pendingReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <RefreshButton onRefresh={handleRefresh} loading={loading} />
      </div>
      
      {loading && !pendingReviews.length ? (
        <LoadingSpinner />
      ) : pendingReviews.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReviews.map(patent => (
              <PendingReviewCard 
                key={patent.id} 
                patent={patent} 
                onApprove={handleApprove}
                onReject={handleReject}
                processingReview={processingReview}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i} className={isMobile && totalPages > 5 && ![0, 1, totalPages - 2, totalPages - 1].includes(i) && i !== currentPage - 1 ? "hidden" : ""}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <EmptyApprovals />
      )}
    </div>
  );
};

export default Approvals;
