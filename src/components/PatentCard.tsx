
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ExternalLink, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export interface PatentCardProps {
  patent: Patent;
  showActions?: boolean;
  showClientInfo?: boolean;
  isCompact?: boolean;
  showReviewBadge?: boolean;
}

const PatentCard: React.FC<PatentCardProps> = ({ 
  patent, 
  showActions = true, 
  showClientInfo = false, 
  isCompact = false,
  showReviewBadge = false
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Determine status based on completion status
  const getStatusBadge = () => {
    if (patent.ps_completion_status === 1 && patent.cs_completion_status === 1) {
      return <Badge variant="success">Completed</Badge>;
    } else if (patent.ps_completion_status === 1) {
      return <Badge variant="outline">PS Completed</Badge>;
    } else if (patent.ps_drafting_status === 1) {
      return <Badge variant="secondary">PS Drafted</Badge>;
    } else if (patent.ps_drafting_status === 0) {
      return <Badge variant="outline">PS Pending</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };
  
  // Calculate pending reviews count for showing in the badge
  const pendingReviewsCount = [
    patent.ps_review_draft_status, 
    patent.ps_review_file_status,
    patent.cs_review_draft_status, 
    patent.cs_review_file_status,
    patent.fer_review_draft_status,
    patent.fer_review_file_status
  ].filter(status => status === 1).length;

  return (
    <Card className={isCompact ? "overflow-hidden" : ""}>
      {!isCompact ? (
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {patent.patent_title}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                ID: {patent.tracking_id}
              </div>
            </div>
            <div className="flex space-x-2">
              {getStatusBadge()}
              {showReviewBadge && pendingReviewsCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {pendingReviewsCount} Review{pendingReviewsCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      ) : (
        <CardHeader className="py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base truncate">
              {patent.patent_title}
            </CardTitle>
            <div className="flex space-x-2">
              {getStatusBadge()}
              {showReviewBadge && pendingReviewsCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {pendingReviewsCount}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={isCompact ? "py-0 px-4" : ""}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Applicant:</div>
            <div className="font-medium">{patent.patent_applicant}</div>
          </div>
          
          {showClientInfo && (
            <div>
              <div className="text-muted-foreground">Client ID:</div>
              <div className="font-medium">{patent.client_id}</div>
            </div>
          )}
          
          <div>
            <div className="text-muted-foreground">Filing Date:</div>
            <div className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" /> 
              {formatDate(patent.date_of_filing)}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Application No:</div>
            <div className="font-medium">{patent.application_no || 'Not assigned'}</div>
          </div>
          
          {!isCompact && (
            <>
              <div className="col-span-2">
                <div className="text-muted-foreground mb-1">Status:</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">PS Draft</span>
                    <Badge variant={patent.ps_drafting_status === 1 ? "success" : "outline"} className="w-fit">
                      {patent.ps_drafting_status === 1 ? "Done" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">PS Filing</span>
                    <Badge variant={patent.ps_filing_status === 1 ? "success" : "outline"} className="w-fit">
                      {patent.ps_filing_status === 1 ? "Done" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">CS Status</span>
                    <Badge variant={patent.cs_completion_status === 1 ? "success" : "outline"} className="w-fit">
                      {patent.cs_completion_status === 1 ? "Done" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {patent.fer_status === 1 && (
                <div className="col-span-2">
                  <div className="text-muted-foreground">FER Status:</div>
                  <div className="font-medium">
                    {patent.fer_completion_status === 1 ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          {!isCompact && patent.ps_drafter_deadline && (
            <div className="col-span-2">
              <div className="text-muted-foreground">Upcoming Deadline:</div>
              <div className="font-medium flex items-center gap-1 text-amber-600">
                <Clock className="h-3 w-3" /> 
                Draft due: {formatDate(patent.ps_drafter_deadline)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {(showActions || isCompact) && (
        <CardFooter className={`${isCompact ? "px-4 py-3" : ""} flex justify-end`}>
          <Button variant="outline" size={isCompact ? "sm" : "default"} asChild>
            <Link to={`/patents/${patent.id}`}>
              View Details {!isCompact && <ExternalLink className="ml-2 h-4 w-4" />}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PatentCard;
