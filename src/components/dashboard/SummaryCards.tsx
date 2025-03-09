
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { FileText, FileCheck, Clock, AlertTriangle } from 'lucide-react';

interface SummaryCardsProps {
  patents: Patent[];
  pendingApprovalCount?: number;
  userAssignedPatents?: Patent[];
  userRole?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  patents, 
  pendingApprovalCount = 0, 
  userAssignedPatents = [], 
  userRole = '' 
}) => {
  const totalPatents = patents.length;
  const completedPatents = patents.filter(p => 
    p.ps_completion_status === 1 && 
    p.cs_completion_status === 1 && 
    (p.fer_status === 0 || p.fer_completion_status === 1)
  ).length;
  
  const inProgressPatents = totalPatents - completedPatents;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPatents}</div>
          <p className="text-xs text-muted-foreground">
            Patents in the system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedPatents}</div>
          <p className="text-xs text-muted-foreground">
            {totalPatents ? ((completedPatents / totalPatents) * 100).toFixed(0) : 0}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressPatents}</div>
          <p className="text-xs text-muted-foreground">
            Patents currently active
          </p>
        </CardContent>
      </Card>
      
      {userRole === 'admin' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovalCount}</div>
            <p className="text-xs text-muted-foreground">
              Items waiting for review
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAssignedPatents.length}</div>
            <p className="text-xs text-muted-foreground">
              Assignments waiting for you
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryCards;
