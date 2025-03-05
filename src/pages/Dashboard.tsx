import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { patents } from '@/lib/data';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, FileCheck, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatentCard from '@/components/PatentCard';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Calculate statistics
  const totalPatents = patents.length;
  const completedPatents = patents.filter(p => 
    p.ps_completion_status === 1 && 
    p.cs_completion_status === 1 && 
    (!p.fer_status || p.fer_completion_status === 1)
  ).length;
  
  const inProgressPatents = totalPatents - completedPatents;
  
  // Calculate deadline approaching patents (with deadline in next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const getDeadlineApproachingPatents = (): Patent[] => {
    return patents.filter(patent => {
      const deadlines = [
        patent.ps_drafter_deadline,
        patent.ps_filer_deadline,
        patent.cs_drafter_deadline,
        patent.cs_filer_deadline,
        patent.fer_drafter_deadline,
        patent.fer_filer_deadline
      ].filter(Boolean) as string[];
      
      return deadlines.some(deadline => {
        const deadlineDate = new Date(deadline);
        return deadlineDate >= today && deadlineDate <= nextWeek;
      });
    });
  };
  
  const deadlineApproachingPatents = getDeadlineApproachingPatents();
  
  // Get user's assigned patents
  const getUserAssignedPatents = (): Patent[] => {
    if (!user) return [];
    
    if (user.role === 'drafter') {
      return patents.filter(patent => 
        (patent.ps_drafting_status === 0 && patent.ps_drafter_assgn === user.full_name) ||
        (patent.cs_drafting_status === 0 && patent.cs_drafter_assgn === user.full_name) ||
        (patent.fer_drafter_status === 0 && patent.fer_drafter_assgn === user.full_name)
      );
    }
    
    if (user.role === 'filer') {
      return patents.filter(patent => 
        (patent.ps_filing_status === 0 && patent.ps_filer_assgn === user.full_name) ||
        (patent.cs_filing_status === 0 && patent.cs_filer_assgn === user.full_name) ||
        (patent.fer_filing_status === 0 && patent.fer_filer_assgn === user.full_name)
      );
    }
    
    return [];
  };
  
  const userAssignedPatents = getUserAssignedPatents();
  
  // Get patents pending approval (admin only)
  const getPendingApprovalCount = (): number => {
    return patents.filter(patent => 
      (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) || 
      (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
      (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
      (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
      (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) ||
      (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0)
    ).length;
  };
  
  const pendingApprovalCount = getPendingApprovalCount();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
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
              {((completedPatents / totalPatents) * 100).toFixed(0)}% completion rate
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
        
        {user?.role === 'admin' ? (
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
      
      {user?.role === 'admin' && pendingApprovalCount > 0 && (
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
      )}
      
      {userAssignedPatents.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Assignments</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(user?.role === 'drafter' ? '/drafts' : '/filings')}
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAssignedPatents.slice(0, 3).map((patent) => (
              <PatentCard key={patent.id} patent={patent} />
            ))}
          </div>
        </div>
      )}
      
      {deadlineApproachingPatents.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Approaching Deadlines</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deadlineApproachingPatents.slice(0, 3).map((patent) => (
              <PatentCard key={patent.id} patent={patent} showDeadline />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
