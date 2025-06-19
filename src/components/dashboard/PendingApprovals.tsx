
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface PendingApprovalsProps {
  pendingApprovalCount: number;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ pendingApprovalCount }) => {
  const navigate = useNavigate();
  
  if (pendingApprovalCount === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Pending Approvals</CardTitle>
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/approvals')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Review and approve patent drafts and filings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-4">
          You have {pendingApprovalCount} item{pendingApprovalCount !== 1 ? 's' : ''} waiting for your approval
        </p>
        <Button className="w-full" onClick={() => navigate('/approvals')}>
          Go to Approvals
        </Button>
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;
