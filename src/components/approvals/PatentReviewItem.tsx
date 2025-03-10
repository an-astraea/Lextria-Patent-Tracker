
import React from 'react';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatentCard from '@/components/PatentCard';

interface PatentReviewItemProps {
  patent: Patent;
  reviewType: string;
  isApproving: boolean;
  formatReviewType: (reviewType: string) => string;
  onApprove: (patent: Patent, reviewType: string) => Promise<void>;
  onReject: (patent: Patent, reviewType: string) => void;
}

const PatentReviewItem = ({
  patent,
  reviewType,
  isApproving,
  formatReviewType,
  onApprove,
  onReject,
}: PatentReviewItemProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
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
          onClick={() => onApprove(patent, reviewType)}
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
          onClick={() => onReject(patent, reviewType)}
          className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
};

export default PatentReviewItem;
