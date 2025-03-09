
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, FileCheck, Clock, AlertTriangle, Users, Briefcase, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatentCard from '@/components/PatentCard';
import { fetchPatents, fetchEmployees, fetchPendingReviews } from '@/lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [recentPatents, setRecentPatents] = useState<Patent[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Patent[]>([]);
  const [metrics, setMetrics] = useState({
    totalPatents: 0,
    activePatents: 0,
    completedPatents: 0,
    pendingReviews: 0,
    totalEmployees: 0,
    totalClients: 0
  });
  const [loading, setLoading] = useState(true);

  // Store the user role from localStorage
  const userRole = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).role : '';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch patents for the recent patents card and metrics
        const patentsResponse = await fetchPatents();
        
        if (patentsResponse.error) {
          toast.error('Failed to load patents data');
        } else {
          // Sort patents by updated_at date and take the most recent 5
          const sortedPatents = [...patentsResponse.patents].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          ).slice(0, 5);
          
          setRecentPatents(sortedPatents);
          
          // Calculate metrics from patents
          const totalPatents = patentsResponse.patents.length;
          const completedPatents = patentsResponse.patents.filter(
            p => p.cs_completion_status === 1
          ).length;
          const activePatents = patentsResponse.patents.filter(
            p => !p.completed && !p.withdrawn
          ).length;
          
          // Get unique client IDs
          const clientIds = new Set(patentsResponse.patents.map(p => p.client_id));
          
          // Update metrics with patent-related data
          setMetrics(prev => ({
            ...prev,
            totalPatents,
            activePatents,
            completedPatents,
            totalClients: clientIds.size
          }));
        }
        
        // Fetch employee data for metrics
        const employeesResponse = await fetchEmployees();
        if (!employeesResponse.error) {
          setMetrics(prev => ({
            ...prev,
            totalEmployees: employeesResponse.employees.length
          }));
        }
        
        // Fetch pending reviews for admin
        if (userRole === 'admin') {
          const reviewsResponse = await fetchPendingReviews();
          if (!reviewsResponse.error) {
            setPendingReviews(reviewsResponse.patents.slice(0, 5));
            setMetrics(prev => ({
              ...prev,
              pendingReviews: reviewsResponse.patents.length
            }));
          }
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('An error occurred while loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userRole]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your patent tracking system
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPatents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activePatents} active patents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Patents</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedPatents}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.completedPatents / metrics.totalPatents) * 100 || 0).toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>
        
        {userRole === 'admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Items awaiting your approval
              </p>
            </CardContent>
          </Card>
        )}
        
        {userRole === 'admin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Drafters and filers in the system
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Unique clients with patents
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Patents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patents</CardTitle>
          <CardDescription>Latest patent activity in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentPatents.length === 0 ? (
            <div className="text-center p-6">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No patents found</h3>
              <p className="text-sm text-muted-foreground">
                There are no patents in the system yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPatents.map(patent => (
                <PatentCard key={patent.id} patent={patent} isCompact />
              ))}
              <div className="text-center mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/patents">View all patents <ChevronRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Reviews - Only show for admin */}
      {userRole === 'admin' && pendingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Patents waiting for your approval</CardDescription>
              </div>
              {pendingReviews.length > 0 && (
                <div className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm font-medium">
                  {pendingReviews.length} pending
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.map(patent => (
                <PatentCard key={patent.id} patent={patent} isCompact showReviewBadge />
              ))}
              <div className="text-center mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/approvals">View all approvals <ChevronRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Overview - Only show for admin */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Client Overview</CardTitle>
            <CardDescription>Summary of client patents and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <Building className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">Client Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View detailed information about client patents
              </p>
              <Button asChild>
                <Link to="/clients">View Client Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
