
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Patent } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, ClipboardList, FileText, FileCheck, AlertCircle, MoreHorizontal, ExternalLink, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import StatusBadge from './StatusBadge';

export interface PatentCardProps {
  patent: Patent;
  isCompact?: boolean;
  showClientInfo?: boolean;
  showReviewBadge?: boolean;
  onDelete?: () => void;
}

const PatentCard = ({ patent, isCompact = false, showClientInfo = false, showReviewBadge = false, onDelete }: PatentCardProps) => {
  const navigate = useNavigate();
  
  // Function to get status text and color
  const getStatus = () => {
    if (patent.withdrawn) {
      return { text: 'Withdrawn', variant: 'destructive' as const };
    }
    if (patent.completed) {
      return { text: 'Completed', variant: 'success' as const };
    }
    
    // Check PS status
    if (patent.ps_completion_status === 1) {
      // CS Status
      if (patent.cs_completion_status === 1) {
        // FER Status
        if (patent.fer_status === 1) {
          if (patent.fer_completion_status === 1) {
            return { text: 'FER Completed', variant: 'success' as const };
          }
          return { text: 'FER in Progress', variant: 'warning' as const };
        }
        return { text: 'CS Completed', variant: 'success' as const };
      }
      return { text: 'PS Completed / CS in Progress', variant: 'warning' as const };
    }
    
    return { text: 'PS in Progress', variant: 'warning' as const };
  };
  
  // Check if patent is under review
  const isUnderReview = 
    patent.ps_review_draft_status === 1 || 
    patent.ps_review_file_status === 1 || 
    patent.cs_review_draft_status === 1 || 
    patent.cs_review_file_status === 1 || 
    patent.fer_review_draft_status === 1 || 
    patent.fer_review_file_status === 1;
  
  // Get status info
  const status = getStatus();
  
  return (
    <Card className={`transition-all hover:border-primary/50 ${isCompact ? 'h-[240px]' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base line-clamp-1" title={patent.patent_title}>
              {patent.patent_title}
            </CardTitle>
            <CardDescription className="line-clamp-1">
              ID: {patent.tracking_id}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge variant={status.variant}>
              {status.text}
            </StatusBadge>
            
            {showReviewBadge && isUnderReview && (
              <Badge variant="warning" className="ml-1">Under Review</Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/patents/${patent.id}`)}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/patents/edit/${patent.id}`)}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Edit Patent
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Patent
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`pb-2 ${isCompact ? 'pt-1' : ''}`}>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Applicant:</span>
            <span className="font-medium">{patent.patent_applicant}</span>
          </div>
          
          {showClientInfo && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client ID:</span>
              <span className="font-medium">{patent.client_id}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Filing Date:</span>
            <span className="font-medium">
              {patent.date_of_filing ? format(new Date(patent.date_of_filing), 'dd MMM yyyy') : 'Not filed yet'}
            </span>
          </div>
          
          {!isCompact && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PS Status:</span>
                <StatusBadge 
                  variant={patent.ps_completion_status === 1 ? "success" : "warning"}
                  size="sm"
                >
                  {patent.ps_completion_status === 1 ? "Completed" : "In Progress"}
                </StatusBadge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">CS Status:</span>
                <StatusBadge 
                  variant={patent.cs_completion_status === 1 ? "success" : "warning"}
                  size="sm"
                >
                  {patent.cs_completion_status === 1 ? "Completed" : "In Progress"}
                </StatusBadge>
              </div>
              
              {patent.fer_status === 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FER Status:</span>
                  <StatusBadge 
                    variant={patent.fer_completion_status === 1 ? "success" : "warning"}
                    size="sm"
                  >
                    {patent.fer_completion_status === 1 ? "Completed" : "In Progress"}
                  </StatusBadge>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {isCompact ? (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => navigate(`/patents/${patent.id}`)}
          >
            View Details
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={() => navigate(`/patents/${patent.id}`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </Button>
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={() => navigate(`/patents/edit/${patent.id}`)}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PatentCard;
