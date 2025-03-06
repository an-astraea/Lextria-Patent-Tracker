
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, FileCheck, Clock, AlertTriangle, Users, Briefcase, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatentCard from '@/components/PatentCard';
import { fetchPatents, fetchDrafterAssignments, fetchFilerAssignments, fetchPendingReviews, fetchEmployees } from '@/lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patents, setPatents] = React.useState<Patent[]>([]);
  const [userAssignedPatents, setUserAssignedPatents] = React.useState<Patent[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState<Patent[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patentsData = await fetchPatents();
        setPatents(patentsData);
        
        // Fetch employee data for admin dashboard
        if (user?.role === 'admin') {
          const employeeData = await fetchEmployees();
          setEmployees(employeeData);
        }
        
        // Fetch user-specific assignments
        if (user?.role === 'drafter') {
          const drafterAssignments = await fetchDrafterAssignments(user.full_name);
          setUserAssignedPatents(drafterAssignments);
        } else if (user?.role === 'filer') {
          const filerAssignments = await fetchFilerAssignments(user.full_name);
          setUserAssignedPatents(filerAssignments);
        } else if (user?.role === 'admin') {
          // Fetch pending approvals for admin
          const approvals = await fetchPendingReviews();
          setPendingApprovals(approvals);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.full_name, user?.role]);
  
  // Add a function to refresh pending approvals specifically for admins
  const refreshPendingApprovals = async () => {
    if (user?.role === 'admin') {
      try {
        const approvals = await fetchPendingReviews();
        setPendingApprovals(approvals);
      } catch (error) {
        console.error('Error refreshing pending approvals:', error);
      }
    }
  };

  // Listen for approval events
  React.useEffect(() => {
    // Create a custom event listener for approval completions
    const handleApprovalComplete = () => {
      refreshPendingApprovals();
    };

    // Add event listener
    window.addEventListener('approval-complete', handleApprovalComplete);

    // Cleanup
    return () => {
      window.removeEventListener('approval-complete', handleApprovalComplete);
    };
  }, []);
  
  // Calculate statistics
  const totalPatents = patents.length;
  const completedPatents = patents.filter(p => 
    p.ps_completion_status === 1 && 
    p.cs_completion_status === 1 && 
    (p.fer_status === 0 || p.fer_completion_status === 1)
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
  
  // Get patents pending approval (admin only)
  const getPendingApprovalCount = (): number => {
    return pendingApprovals.length;
  };
  
  const pendingApprovalCount = getPendingApprovalCount();

  // New statistics for admin dashboard
  const getEmployeeStatistics = () => {
    if (user?.role !== 'admin' || !patents.length) return null;

    // Count assignments by employee
    const employeeStats = new Map();
    
    patents.forEach(patent => {
      // PS drafting assignments
      if (patent.ps_drafter_assgn) {
        const key = patent.ps_drafter_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).drafting += 1;
        
        if (patent.ps_drafting_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      // PS filing assignments
      if (patent.ps_filer_assgn) {
        const key = patent.ps_filer_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).filing += 1;
        
        if (patent.ps_filing_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      // CS drafting assignments
      if (patent.cs_drafter_assgn) {
        const key = patent.cs_drafter_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).drafting += 1;
        
        if (patent.cs_drafting_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      // CS filing assignments
      if (patent.cs_filer_assgn) {
        const key = patent.cs_filer_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).filing += 1;
        
        if (patent.cs_filing_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      // FER drafting assignments
      if (patent.fer_drafter_assgn) {
        const key = patent.fer_drafter_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).drafting += 1;
        
        if (patent.fer_drafter_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      // FER filing assignments
      if (patent.fer_filer_assgn) {
        const key = patent.fer_filer_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).filing += 1;
        
        if (patent.fer_filing_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
    });
    
    return employeeStats;
  };
  
  const getClientStatistics = () => {
    if (user?.role !== 'admin' || !patents.length) return null;

    // Count patents by client
    const clientStats = new Map();
    
    patents.forEach(patent => {
      const clientId = patent.client_id;
      if (!clientStats.has(clientId)) {
        clientStats.set(clientId, {
          total: 0,
          completed: 0,
          inProgress: 0,
          employees: new Set()
        });
      }
      
      clientStats.get(clientId).total += 1;
      
      // Count as completed if PS and CS are completed and FER is either not required or completed
      if (patent.ps_completion_status === 1 && 
          patent.cs_completion_status === 1 && 
          (patent.fer_status === 0 || patent.fer_completion_status === 1)) {
        clientStats.get(clientId).completed += 1;
      } else {
        clientStats.get(clientId).inProgress += 1;
      }
      
      // Track employees working on this client's patents
      [
        patent.ps_drafter_assgn, 
        patent.ps_filer_assgn,
        patent.cs_drafter_assgn,
        patent.cs_filer_assgn,
        patent.fer_drafter_assgn,
        patent.fer_filer_assgn
      ].filter(Boolean).forEach(emp => {
        if (emp) clientStats.get(clientId).employees.add(emp);
      });
    });
    
    // Convert employee Sets to counts
    for (const [clientId, stats] of clientStats.entries()) {
      clientStats.set(clientId, {
        ...stats,
        employeeCount: stats.employees.size,
        employees: Array.from(stats.employees)
      });
    }
    
    return clientStats;
  };
  
  const getPatentStatusStats = () => {
    if (user?.role !== 'admin' || !patents.length) return null;
    
    return {
      ps: {
        drafted: patents.filter(p => p.ps_drafting_status === 1).length,
        filed: patents.filter(p => p.ps_filing_status === 1).length,
        completed: patents.filter(p => p.ps_completion_status === 1).length,
      },
      cs: {
        drafted: patents.filter(p => p.cs_drafting_status === 1).length,
        filed: patents.filter(p => p.cs_filing_status === 1).length,
        completed: patents.filter(p => p.cs_completion_status === 1).length,
      },
      fer: {
        required: patents.filter(p => p.fer_status === 1).length,
        drafted: patents.filter(p => p.fer_drafter_status === 1).length,
        filed: patents.filter(p => p.fer_filing_status === 1).length,
        completed: patents.filter(p => p.fer_completion_status === 1).length,
      }
    };
  };
  
  const employeeStats = getEmployeeStatistics();
  const clientStats = getClientStatistics();
  const statusStats = getPatentStatusStats();
  
  // Get top employees by assignments completed
  const getTopEmployees = () => {
    if (!employeeStats) return [];
    
    return Array.from(employeeStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  };
  
  // Get top clients by patent count
  const getTopClients = () => {
    if (!clientStats) return [];
    
    return Array.from(clientStats.entries())
      .map(([clientId, stats]) => ({ clientId, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };
  
  const topEmployees = getTopEmployees();
  const topClients = getTopClients();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
      
      {/* Admin specific statistics */}
      {user?.role === 'admin' && statusStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provisional Specification</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.ps.drafted}</div>
                  <p className="text-xs text-muted-foreground">Drafted</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.ps.filed}</div>
                  <p className="text-xs text-muted-foreground">Filed</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.ps.completed}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complete Specification</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.cs.drafted}</div>
                  <p className="text-xs text-muted-foreground">Drafted</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.cs.filed}</div>
                  <p className="text-xs text-muted-foreground">Filed</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.cs.completed}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First Examination Report</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 py-2">
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.fer.required}</div>
                  <p className="text-xs text-muted-foreground">Required</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.fer.drafted}</div>
                  <p className="text-xs text-muted-foreground">Drafted</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.fer.filed}</div>
                  <p className="text-xs text-muted-foreground">Filed</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{statusStats.fer.completed}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Employee Statistics */}
      {user?.role === 'admin' && topEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Employee Performance</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Top employees by completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEmployees.map((employee, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.drafting} drafting, {employee.filing} filing tasks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{employee.completed} completed</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.inProgress} in progress
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Client Statistics */}
      {user?.role === 'admin' && topClients.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Client Overview</CardTitle>
              <Building className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Patents by client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Client {client.clientId}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.employeeCount} employees assigned
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{client.total} patents</p>
                    <p className="text-xs text-muted-foreground">
                      {client.completed} completed, {client.inProgress} in progress
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
              <PatentCard key={patent.id} patent={patent} showDeadline />
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
