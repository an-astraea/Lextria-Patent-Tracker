
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, Users } from 'lucide-react';

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
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <CardTitle>Pending Approvals</CardTitle>
            <Badge variant="destructive" className="ml-2">
              {pendingApprovalCount}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/approvals')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Review and approve patent drafts and filings from team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">
                {pendingApprovalCount} approval{pendingApprovalCount !== 1 ? 's' : ''} pending
              </p>
              <p className="text-sm text-amber-700">
                Patents waiting for your review and approval
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/approvals')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Review Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;
