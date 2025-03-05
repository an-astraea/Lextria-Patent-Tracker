
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchPendingReviews, approvePatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import PendingReviewCard, { ReviewType, getPendingReviewTypes } from '@/components/approvals/PendingReviewCard';
import RefreshButton from '@/components/approvals/RefreshButton';
import EmptyApprovals from '@/components/approvals/EmptyApprovals';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';

const Approvals = () => {
  const navigate = useNavigate();
  const [pendingReviews, setPendingReviews] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

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
    }
  };

  const handleRefresh = () => {
    loadReviews();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <RefreshButton onRefresh={handleRefresh} loading={loading} />
      </div>
      
      {loading && !pendingReviews.length ? (
        <LoadingSpinner />
      ) : pendingReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingReviews.map(patent => (
            <PendingReviewCard 
              key={patent.id} 
              patent={patent} 
              onApprove={handleApprove} 
            />
          ))}
        </div>
      ) : (
        <EmptyApprovals />
      )}
    </div>
  );
};

export default Approvals;
