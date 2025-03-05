
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  BarChart, 
  FileCheck,
  AlertCircle,
  FilePen,
  Calendar,
  CheckCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patents, employees, getPatentsPendingApproval } from '@/lib/data';
import { User } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [pendingPatents, setPendingPatents] = useState(getPatentsPendingApproval());

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Calculate statistics
  const totalPatents = patents.length;
  const pendingApprovalCount = pendingPatents.length;
  const totalEmployees = employees.length;
  
  const completedDrafts = patents.filter(p => 
    p.ps_drafting_status === 1 || p.cs_drafting_status === 1 || p.fer_drafter_status === 1
  ).length;
  
  const completedFilings = patents.filter(p => 
    p.ps_filing_status === 1 || p.cs_filing_status === 1 || p.fer_filing_status === 1
  ).length;

  const drafterCount = employees.filter(e => e.role === 'drafter').length;
  const filerCount = employees.filter(e => e.role === 'filer').length;

  return (
    <div className="flex min-h-screen bg-background">
      {user && <Sidebar user={user} onLogout={handleLogout} />}
      
      <div className="flex-1 p-6 md:p-8 md:ml-64 transition-all duration-300 ease-in-out">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your patent tracking system
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Patents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All patents in the system
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovalCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Patents awaiting your review
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Drafters: {drafterCount}, Filers: {filerCount}
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalPatents ? Math.round((completedDrafts / (totalPatents * 2)) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall task completion
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
            <Card className="md:col-span-2 glass">
              <CardHeader>
                <CardTitle>Patent Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FilePen className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium">Drafting Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                      <span className="text-sm">{completedDrafts} patents</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm font-medium">Filing Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                      <span className="text-sm">{completedFilings} patents</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-sm font-medium">Awaiting Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-sm">{pendingApprovalCount} patents</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCheck className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm font-medium">Fully Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
                      <span className="text-sm">
                        {patents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1).length} patents
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patents.slice(0, 4).map((patent, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{patent.patent_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(patent.updated_at).toLocaleDateString()} - Status updated
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button 
              onClick={() => navigate('/patents/add')} 
              className="shadow-md"
            >
              <FileText className="mr-2 h-4 w-4" /> 
              Add New Patent
            </Button>
            <Button 
              onClick={() => navigate('/employees/add')} 
              variant="outline" 
              className="shadow-sm"
            >
              <Users className="mr-2 h-4 w-4" /> 
              Add New Employee
            </Button>
            <Button 
              onClick={() => navigate('/approvals')} 
              variant="secondary" 
              className="shadow-sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> 
              Review Pending Approvals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
