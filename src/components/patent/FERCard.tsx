
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PencilIcon, CheckCircleIcon, FileType, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { FEREntry } from '@/lib/types';

interface FERCardProps {
  fer: FEREntry;
  userRole: string;
  userName: string;
  onEdit: (fer: FEREntry) => void;
  onDelete: (fer: FEREntry) => void;
  onCompleteDraft: (fer: FEREntry) => Promise<void>;
  onCompleteFiling: (fer: FEREntry) => Promise<void>;
  onApproveDraft: (fer: FEREntry) => Promise<void>;
  onApproveFiling: (fer: FEREntry) => Promise<void>;
  isApprovingDraft: boolean;
  isApprovingFiling: boolean;
}

const FERCard: React.FC<FERCardProps> = ({
  fer,
  userRole,
  userName,
  onEdit,
  onDelete,
  onCompleteDraft,
  onCompleteFiling,
  onApproveDraft,
  onApproveFiling,
  isApprovingDraft,
  isApprovingFiling
}) => {
  const canCompleteDraft = () => {
    return userName === fer.fer_drafter_assgn && fer.fer_drafter_status === 0;
  };

  const canCompleteFiling = () => {
    return userName === fer.fer_filer_assgn && fer.fer_filing_status === 0 && fer.fer_drafter_status === 1;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">FER #{fer.fer_number || 1}</CardTitle>
          <div className="flex items-center gap-2">
            {fer.fer_date && (
              <Badge variant="outline">
                Date: {format(new Date(fer.fer_date), 'dd MMM yyyy')}
              </Badge>
            )}
            
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(fer)}>
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(fer)}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Drafting Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={fer.fer_drafter_status === 1 ? "success" : "default"}>
                    {fer.fer_drafter_status === 1 ? "Completed" : "Pending"}
                  </Badge>
                  <Badge variant={fer.fer_review_draft_status === 1 ? "success" : "default"} className="ml-2">
                    {fer.fer_review_draft_status === 1 ? "Approved" : "Not Approved"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {canCompleteDraft() && (
                    <Button size="sm" onClick={() => onCompleteDraft(fer)}>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Complete Draft
                    </Button>
                  )}
                  
                  {userRole === 'admin' && fer.fer_drafter_status === 1 && fer.fer_review_draft_status === 0 && (
                    <Button size="sm" onClick={() => onApproveDraft(fer)} disabled={isApprovingDraft}>
                      {isApprovingDraft ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Approve Draft
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Drafter: <span className="font-medium">{fer.fer_drafter_assgn || 'Unassigned'}</span>
                </p>
                {fer.fer_drafter_deadline && (
                  <p className="text-sm text-muted-foreground">
                    Deadline: <span className="font-medium">{format(new Date(fer.fer_drafter_deadline), 'dd MMM yyyy')}</span>
                  </p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-1">Filing Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={fer.fer_filing_status === 1 ? "success" : "default"}>
                    {fer.fer_filing_status === 1 ? "Completed" : "Pending"}
                  </Badge>
                  <Badge variant={fer.fer_review_file_status === 1 ? "success" : "default"} className="ml-2">
                    {fer.fer_review_file_status === 1 ? "Approved" : "Not Approved"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {canCompleteFiling() && (
                    <Button size="sm" onClick={() => onCompleteFiling(fer)}>
                      <FileType className="h-4 w-4 mr-2" />
                      Complete Filing
                    </Button>
                  )}
                  
                  {userRole === 'admin' && fer.fer_filing_status === 1 && fer.fer_review_file_status === 0 && (
                    <Button size="sm" onClick={() => onApproveFiling(fer)} disabled={isApprovingFiling}>
                      {isApprovingFiling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Approve Filing
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Filer: <span className="font-medium">{fer.fer_filer_assgn || 'Unassigned'}</span>
                </p>
                {fer.fer_filer_deadline && (
                  <p className="text-sm text-muted-foreground">
                    Deadline: <span className="font-medium">{format(new Date(fer.fer_filer_deadline), 'dd MMM yyyy')}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Completion Status</h3>
              <Badge variant={fer.fer_completion_status === 1 ? "success" : "default"} className="text-base">
                {fer.fer_completion_status === 1 ? "Complete" : "Incomplete"}
              </Badge>
              
              {fer.fer_completion_status === 1 && (
                <p className="text-sm text-muted-foreground mt-2">
                  All tasks for this FER have been completed and approved.
                </p>
              )}
              
              {fer.fer_completion_status === 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Pending tasks:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {fer.fer_drafter_status === 0 && (
                      <li>Drafting needs to be completed</li>
                    )}
                    {fer.fer_drafter_status === 1 && fer.fer_review_draft_status === 0 && (
                      <li>Drafting needs to be approved</li>
                    )}
                    {fer.fer_filing_status === 0 && fer.fer_drafter_status === 1 && (
                      <li>Filing needs to be completed</li>
                    )}
                    {fer.fer_filing_status === 1 && fer.fer_review_file_status === 0 && (
                      <li>Filing needs to be approved</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FERCard;
