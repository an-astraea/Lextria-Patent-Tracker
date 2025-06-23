
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Patent } from '@/lib/types';
import { 
  fetchPatents, 
  fetchDrafterAssignments, 
  fetchFilerAssignments, 
  fetchPendingReviews, 
  fetchEmployees 
} from '@/lib/api';
import { toast } from 'sonner';

// Import refactored components
import SummaryCards from '@/components/dashboard/SummaryCards';
import ConversionStats from '@/components/dashboard/ConversionStats';
import PatentStageChart from '@/components/dashboard/PatentStageChart';
import PatentStatusStats from '@/components/dashboard/PatentStatusStats';
import PatentStateTable from '@/components/dashboard/PatentStateTable';
import PatentStatusTable from '@/components/dashboard/PatentStatusTable';
import EmployeePatentTable from '@/components/dashboard/EmployeePatentTable';
import TopEmployees from '@/components/dashboard/TopEmployees';
import TopClients from '@/components/dashboard/TopClients';
import PendingApprovals from '@/components/dashboard/PendingApprovals';
import UserAssignments from '@/components/dashboard/UserAssignments';
import DeadlinePatents from '@/components/dashboard/DeadlinePatents';
import EmployeePatentStatusTable from '@/components/dashboard/EmployeePatentStatusTable';
import StagnantPatentsReminder from '@/components/dashboard/StagnantPatentsReminder';

const Dashboard = () => {
  const location = useLocation();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [userAssignedPatents, setUserAssignedPatents] = useState<Patent[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Patent[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Check if this is the company dashboard route
  const isCompanyDashboard = location.pathname === '/company-dashboard';
  
  // For personal dashboard (/dashboard), redirect drafters and filers to their employee dashboard
  // For company dashboard (/company-dashboard), show the company view for all users
  useEffect(() => {
    if (!isCompanyDashboard && user && (user.role === 'drafter' || user.role === 'filer')) {
      window.location.href = `/employee/${encodeURIComponent(user.full_name)}`;
      return;
    }
  }, [user, isCompanyDashboard]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patentsData = await fetchPatents();
        setPatents(patentsData);
        
        if (user?.role === 'admin') {
          const employeeData = await fetchEmployees();
          setEmployees(employeeData);
        }
        
        if (user?.role === 'drafter') {
          const drafterAssignments = await fetchDrafterAssignments(user.full_name);
          setUserAssignedPatents(drafterAssignments);
        } else if (user?.role === 'filer') {
          const filerAssignments = await fetchFilerAssignments(user.full_name);
          setUserAssignedPatents(filerAssignments);
        } else if (user?.role === 'admin') {
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

    // Fetch data for company dashboard (all users) or admin personal dashboard
    if (isCompanyDashboard || user?.role === 'admin') {
      fetchData();
    }
  }, [user?.full_name, user?.role, isCompanyDashboard]);
  
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

  useEffect(() => {
    const handleApprovalComplete = () => {
      refreshPendingApprovals();
    };

    window.addEventListener('approval-complete', handleApprovalComplete);

    return () => {
      window.removeEventListener('approval-complete', handleApprovalComplete);
    };
  }, []);
  
  const pendingApprovalCount = pendingApprovals.length;

  // Show loading for company dashboard or admin users
  if (loading && (isCompanyDashboard || user?.role === 'admin')) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Only render the company dashboard for company dashboard route or admin users on personal dashboard
  if (!isCompanyDashboard && user?.role !== 'admin') {
    return null; // Component will redirect, so return null
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {isCompanyDashboard ? 'Company Dashboard' : 'Dashboard'}
      </h1>
      
      {/* Stagnant Patents Reminder */}
      <StagnantPatentsReminder userRole={user?.role} />
      
      {/* Company-wide employee patent status table */}
      <EmployeePatentStatusTable patents={patents} />
      
      {/* Company dashboard sections */}
      <>
        {/* Summary Cards */}
        <SummaryCards 
          patents={patents} 
          pendingApprovalCount={pendingApprovalCount}
          userAssignedPatents={userAssignedPatents}
          userRole={user?.role}
        />
        
        {/* Patent Processing State Table */}
        <PatentStatusTable patents={patents} />
        
        {/* Patent State Table (geographical) */}
        <PatentStateTable patents={patents} />
        
        {/* Conversion Stats */}
        <ConversionStats patents={patents} />
        
        {/* Patent Stage Chart */}
        {patents.length > 0 && (
          <PatentStageChart patents={patents} />
        )}
        
        {/* Patent Status Stats */}
        <PatentStatusStats patents={patents} />
        
        {/* Employee Patent Table */}
        <EmployeePatentTable patents={patents} />
        
        {/* Top Employees */}
        <TopEmployees patents={patents} />
        
        {/* Top Clients */}
        <TopClients patents={patents} />
        
        {/* Pending Approvals - only show for admin */}
        {user?.role === 'admin' && (
          <PendingApprovals pendingApprovalCount={pendingApprovalCount} />
        )}
      </>
      
      {/* Deadline Patents */}
      <DeadlinePatents patents={patents} />
    </div>
  );
};

export default Dashboard;
