
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchPendingReviews, approvePatentReview, rejectPatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import PendingReviewCard, { ReviewType, getPendingReviewTypes } from '@/components/approvals/PendingReviewCard';
import RefreshButton from '@/components/approvals/RefreshButton';
import EmptyApprovals from '@/components/approvals/EmptyApprovals';
import LoadingSpinner from '@/components/approvals/LoadingSpinner';
import SearchFilters from '@/components/common/SearchFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useIsMobile } from '@/hooks/use-mobile';

const ITEMS_PER_PAGE = 6; // Number of items to show per page

const Approvals = () => {
  const navigate = useNavigate();
  const [pendingReviews, setPendingReviews] = useState<Patent[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Redirect if not admin or filer
  React.useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'filer')) {
      toast.error('Access denied. Admin or Filer privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load data only once on initial mount
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'filer') && !initialLoadDone) {
      loadReviews();
      setInitialLoadDone(true);
    }
  }, [user, initialLoadDone]);

  // Update filtered reviews when pending reviews change
  useEffect(() => {
    setFilteredReviews(pendingReviews);
  }, [pendingReviews]);

  const loadReviews = async () => {
    if (user && (user.role === 'admin' || user.role === 'filer')) {
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

  const handleSearch = (query: string, field?: string) => {
    if (!query.trim()) {
      setFilteredReviews(pendingReviews);
      setCurrentPage(1);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = pendingReviews.filter(patent => {
      if (field) {
        switch (field) {
          case 'tracking_id':
            return patent.tracking_id.toLowerCase().includes(searchQuery);
          case 'patent_title':
            return patent.patent_title.toLowerCase().includes(searchQuery);
          case 'patent_applicant':
            return patent.patent_applicant.toLowerCase().includes(searchQuery);
          case 'client_id':
            return patent.client_id.toLowerCase().includes(searchQuery);
          case 'ps_drafter_assgn':
            return patent.ps_drafter_assgn?.toLowerCase().includes(searchQuery) || false;
          case 'ps_filer_assgn':
            return patent.ps_filer_assgn?.toLowerCase().includes(searchQuery) || false;
          case 'cs_drafter_assgn':
            return patent.cs_drafter_assgn?.toLowerCase().includes(searchQuery) || false;
          case 'cs_filer_assgn':
            return patent.cs_filer_assgn?.toLowerCase().includes(searchQuery) || false;
          case 'fer_drafter_assgn':
            return patent.fer_drafter_assgn?.toLowerCase().includes(searchQuery) || false;
          case 'fer_filer_assgn':
            return patent.fer_filer_assgn?.toLowerCase().includes(searchQuery) || false;
          case 'all_employees':
            return (
              patent.ps_drafter_assgn?.toLowerCase().includes(searchQuery) ||
              patent.ps_filer_assgn?.toLowerCase().includes(searchQuery) ||
              patent.cs_drafter_assgn?.toLowerCase().includes(searchQuery) ||
              patent.cs_filer_assgn?.toLowerCase().includes(searchQuery) ||
              patent.fer_drafter_assgn?.toLowerCase().includes(searchQuery) ||
              patent.fer_filer_assgn?.toLowerCase().includes(searchQuery)
            );
          default:
            return false;
        }
      } else {
        // Search across all relevant fields including employee assignments
        return (
          patent.tracking_id.toLowerCase().includes(searchQuery) ||
          patent.patent_title.toLowerCase().includes(searchQuery) ||
          patent.patent_applicant.toLowerCase().includes(searchQuery) ||
          patent.client_id.toLowerCase().includes(searchQuery) ||
          patent.ps_drafter_assgn?.toLowerCase().includes(searchQuery) ||
          patent.ps_filer_assgn?.toLowerCase().includes(searchQuery) ||
          patent.cs_drafter_assgn?.toLowerCase().includes(searchQuery) ||
          patent.cs_filer_assgn?.toLowerCase().includes(searchQuery) ||
          patent.fer_drafter_assgn?.toLowerCase().includes(searchQuery) ||
          patent.fer_filer_assgn?.toLowerCase().includes(searchQuery)
        );
      }
    });

    setFilteredReviews(filtered);
    setCurrentPage(1);
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

  const handleReject = async (patent: Patent, reviewType: ReviewType) => {
    try {
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
    }
  };

  const handleRefresh = () => {
    loadReviews();
  };

  // Pagination logic - use filtered reviews
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Enhanced search fields configuration with employee assignments
  const searchFields = [
    { value: 'tracking_id', label: 'Tracking ID' },
    { value: 'patent_title', label: 'Patent Title' },
    { value: 'patent_applicant', label: 'Applicant' },
    { value: 'client_id', label: 'Client ID' },
    { value: 'ps_drafter_assgn', label: 'PS Drafter' },
    { value: 'ps_filer_assgn', label: 'PS Filer' },
    { value: 'cs_drafter_assgn', label: 'CS Drafter' },
    { value: 'cs_filer_assgn', label: 'CS Filer' },
    { value: 'fer_drafter_assgn', label: 'FER Drafter' },
    { value: 'fer_filer_assgn', label: 'FER Filer' },
    { value: 'all_employees', label: 'Any Employee' }
  ];

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <RefreshButton onRefresh={handleRefresh} loading={loading} />
      </div>
      
      {/* Enhanced Search Filters */}
      <div className="mb-6">
        <SearchFilters
          onSearch={handleSearch}
          placeholder="Search pending approvals by patent details or employee names..."
          searchFields={searchFields}
        />
      </div>
      
      {loading && !pendingReviews.length ? (
        <LoadingSpinner />
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReviews.map(patent => (
              <PendingReviewCard 
                key={patent.id} 
                patent={patent} 
                onApprove={handleApprove}
                onReject={handleReject}
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
      ) : pendingReviews.length > 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No approvals found matching your search criteria.</p>
        </div>
      ) : (
        <EmptyApprovals />
      )}
    </div>
  );
};

export default Approvals;
