
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Patent } from '@/lib/types';
import { Check, Eye, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type ReviewType = 'ps_draft' | 'ps_file' | 'cs_draft' | 'cs_file' | 'fer_draft' | 'fer_file';

interface ReviewItem {
  type: ReviewType;
  label: string;
  person: string;
}

interface PendingReviewCardProps {
  patent: Patent;
  onApprove: (patent: Patent, reviewType: ReviewType) => Promise<void>;
  onReject: (patent: Patent, reviewType: ReviewType) => Promise<void>;
  processingReview: { patentId: string, type: ReviewType } | null;
}

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not Filed Yet';
  return new Date(dateString).toLocaleDateString();
};

// Get pending review types for a patent
export const getPendingReviewTypes = (patent: Patent): ReviewItem[] => {
  const reviews = [];
  
  if (patent.ps_review_draft_status === 1) {
    reviews.push({
      type: 'ps_draft' as const,
      label: 'PS Drafting',
      person: patent.ps_drafter_assgn || ''
    });
  }
  
  if (patent.ps_review_file_status === 1) {
    reviews.push({
      type: 'ps_file' as const,
      label: 'PS Filing',
      person: patent.ps_filer_assgn || ''
    });
  }
  
  if (patent.cs_review_draft_status === 1) {
    reviews.push({
      type: 'cs_draft' as const,
      label: 'CS Drafting',
      person: patent.cs_drafter_assgn || ''
    });
  }
  
  if (patent.cs_review_file_status === 1) {
    reviews.push({
      type: 'cs_file' as const,
      label: 'CS Filing',
      person: patent.cs_filer_assgn || ''
    });
  }
  
  if (patent.fer_review_draft_status === 1) {
    reviews.push({
      type: 'fer_draft' as const,
      label: 'FER Drafting',
      person: patent.fer_drafter_assgn || ''
    });
  }
  
  if (patent.fer_review_file_status === 1) {
    reviews.push({
      type: 'fer_file' as const,
      label: 'FER Filing',
      person: patent.fer_filer_assgn || ''
    });
  }
  
  return reviews;
};

const PendingReviewCard: React.FC<PendingReviewCardProps> = ({ 
  patent, 
  onApprove, 
  onReject,
  processingReview
}) => {
  const navigate = useNavigate();
  const reviews = getPendingReviewTypes(patent);

  const isProcessing = (reviewType: ReviewType) => {
    return processingReview && 
           processingReview.patentId === patent.id && 
           processingReview.type === reviewType;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onReject(patent, review.type)}
                      disabled={isProcessing(review.type)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      {isProcessing(review.type) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onApprove(patent, review.type)}
                      disabled={isProcessing(review.type)}
                    >
                      {isProcessing(review.type) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
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
};

export default PendingReviewCard;
