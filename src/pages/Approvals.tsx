import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { fetchPendingReviews, approvePatentReview } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Eye, Check, RefreshCw } from 'lucide-react';

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

  const handleApprove = async (patent: Patent, reviewType: 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file') => {
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
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  // Get pending review types for a patent
  const getPendingReviewTypes = (patent: Patent) => {
    const reviews = [];
    
    if (patent.ps_review_draft_status === 1) {
      reviews.push({
        type: 'ps_draft' as const,
        label: 'PS Drafting',
        person: patent.ps_drafter_assgn
      });
    }
    
    if (patent.ps_review_file_status === 1) {
      reviews.push({
        type: 'ps_file' as const,
        label: 'PS Filing',
        person: patent.ps_filer_assgn
      });
    }
    
    if (patent.cs_review_draft_status === 1) {
      reviews.push({
        type: 'cs_draft' as const,
        label: 'CS Drafting',
        person: patent.cs_drafter_assgn
      });
    }
    
    if (patent.cs_review_file_status === 1) {
      reviews.push({
        type: 'cs_file' as const,
        label: 'CS Filing',
        person: patent.cs_filer_assgn
      });
    }
    
    if (patent.fer_review_draft_status === 1) {
      reviews.push({
        type: 'fer_draft' as const,
        label: 'FER Drafting',
        person: patent.fer_drafter_assgn
      });
    }
    
    if (patent.fer_review_file_status === 1) {
      reviews.push({
        type: 'fer_file' as const,
        label: 'FER Filing',
        person: patent.fer_filer_assgn
      });
    }
    
    return reviews;
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleRefresh = () => {
    loadReviews();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      {loading && !pendingReviews.length ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : pendingReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingReviews.map(patent => {
            const reviews = getPendingReviewTypes(patent);
            
            return (
              <Card key={patent.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="truncate">{patent.patent_title}</CardTitle>
                  <CardDescription>ID: {patent.tracking_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div><span className="font-medium">Applicant:</span> {patent.patent_applicant}</div>
                    <div><span className="font-medium">Client ID:</span> {patent.client_id}</div>
                    <div><span className="font-medium">Filing Date:</span> {formatDate(patent.date_of_filing)}</div>
                    
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Pending Reviews:</h4>
                      <div className="space-y-2">
                        {reviews.map((review, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <Badge variant="outline" className="mr-2">{review.label}</Badge>
                              <span className="text-sm text-gray-500">by {review.person}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleApprove(patent, review.type)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/patents/${patent.id}`)}
                      className="w-full mt-2"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">No pending approvals found</p>
        </div>
      )}
    </div>
  );
};

export default Approvals;
