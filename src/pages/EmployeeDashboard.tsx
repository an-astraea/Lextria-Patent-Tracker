import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Download } from 'lucide-react';
import { Patent } from '@/lib/types';
import { fetchPatents } from '@/lib/api';
import { toast } from 'sonner';
import SearchFilters from '@/components/common/SearchFilters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { determinePatentStatus, PatentStatus } from '@/lib/utils/status-utils';

interface EnhancedPatent extends Patent {
  tasks: {
    type: string;
    status: string;
    deadline?: string;
  }[];
}

const EmployeeDashboard = () => {
  const { employeeName } = useParams<{ employeeName: string }>();
  const navigate = useNavigate();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<EnhancedPatent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | null>(null);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Check if this is the user's own dashboard or if user is admin
  const isOwnDashboard = user && employeeName === user.full_name;
  const isAdmin = user?.role === 'admin';
  const canViewDashboard = isOwnDashboard || isAdmin;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canViewDashboard) {
      toast.error('Access denied. You can only view your own dashboard.');
      navigate('/dashboard');
    }
  }, [canViewDashboard, navigate]);

  useEffect(() => {
    const fetchEmployeePatents = async () => {
      if (!employeeName) return;
      
      try {
        setLoading(true);
        const allPatents = await fetchPatents();
        
        // Filter patents where the employee is assigned to any task
        const employeePatents = allPatents.filter(patent => 
          patent.ps_drafter_assgn === employeeName ||
          patent.ps_filer_assgn === employeeName ||
          patent.cs_drafter_assgn === employeeName ||
          patent.cs_filer_assgn === employeeName ||
          patent.fer_drafter_assgn === employeeName ||
          patent.fer_filer_assgn === employeeName
        );
        
        setPatents(employeePatents);
      } catch (error) {
        console.error('Error fetching employee patents:', error);
        toast.error('Failed to load employee patents');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeePatents();
  }, [employeeName]);

  // Calculate employee stats - count unique patents by their overall status
  const employeeStats = useMemo(() => {
    if (!employeeName) return { completed: 0, drafting: 0, review: 0, pendingConfirmation: 0, pendingInformation: 0, total: 0 };

    let completed = 0;
    let drafting = 0;
    let review = 0;
    let pendingConfirmation = 0;
    let pendingInformation = 0;

    patents.forEach(patent => {
      // Check if this employee is assigned to this patent in any role
      const isAssigned = patent.ps_drafter_assgn === employeeName ||
                        patent.ps_filer_assgn === employeeName ||
                        patent.cs_drafter_assgn === employeeName ||
                        patent.cs_filer_assgn === employeeName ||
                        patent.fer_drafter_assgn === employeeName ||
                        patent.fer_filer_assgn === employeeName;

      if (!isAssigned) {
        return; // Skip if employee not assigned
      }

      // Use the new status determination utility
      const currentStatus = determinePatentStatus(patent);
      
      // Map statuses to employee dashboard categories
      switch (currentStatus) {
        case 'completed':
          completed++;
          break;
        case 'ps_drafting_approval':
        case 'ps_filing_approval':
        case 'cs_drafting_approval':
        case 'cs_filing_approval':
          review++;
          break;
        case 'cs_data_sent':
          if (patent.pending_cs_confirmation) {
            pendingConfirmation++;
          } else {
            pendingInformation++;
          }
          break;
        case 'idf_sent':
          if (patent.pending_ps_confirmation) {
            pendingConfirmation++;
          } else {
            pendingInformation++;
          }
          break;
        default:
          drafting++;
          break;
      }
    });

    return {
      completed,
      drafting,
      review,
      pendingConfirmation,
      pendingInformation,
      total: patents.length
    };
  }, [patents, employeeName]);

  // Enhanced patent data with task details
  const enhancedPatents = useMemo(() => {
    return patents.map(patent => {
      const tasks = [];
      const currentStatus = determinePatentStatus(patent);
      
      if (patent.ps_drafter_assgn === employeeName) {
        let status = 'Drafting';
        if (currentStatus === 'ps_drafting_approval') status = 'Review';
        else if (['ps_completed', 'cs_data_sent', 'cs_data_received', 'cs_drafting', 'cs_drafting_approval', 'cs_filing', 'cs_filing_approval', 'cs_completed', 'completed'].includes(currentStatus)) status = 'Completed';
        else if (currentStatus === 'idf_sent' && patent.pending_ps_confirmation) status = 'Pending Confirmation';
        else if (currentStatus === 'idf_sent' && !patent.idf_received) status = 'Pending Information';
        
        tasks.push({
          type: 'PS Drafter',
          status,
          deadline: patent.ps_drafter_deadline
        });
      }

      if (patent.ps_filer_assgn === employeeName) {
        let status = 'Drafting';
        if (currentStatus === 'ps_filing_approval') status = 'Review';
        else if (['ps_completed', 'cs_data_sent', 'cs_data_received', 'cs_drafting', 'cs_drafting_approval', 'cs_filing', 'cs_filing_approval', 'cs_completed', 'completed'].includes(currentStatus)) status = 'Completed';
        else if (currentStatus === 'idf_sent' && patent.pending_ps_confirmation) status = 'Pending Confirmation';
        else if (currentStatus === 'idf_sent' && !patent.idf_received) status = 'Pending Information';
        
        tasks.push({
          type: 'PS Filer',
          status,
          deadline: patent.ps_filer_deadline
        });
      }

      if (patent.cs_drafter_assgn === employeeName) {
        let status = 'Drafting';
        if (currentStatus === 'cs_drafting_approval') status = 'Review';
        else if (['cs_completed', 'completed'].includes(currentStatus)) status = 'Completed';
        else if (currentStatus === 'cs_data_sent' && patent.pending_cs_confirmation) status = 'Pending Confirmation';
        else if (currentStatus === 'cs_data_sent' && !patent.cs_data_received) status = 'Pending Information';
        
        tasks.push({
          type: 'CS Drafter',
          status,
          deadline: patent.cs_drafter_deadline
        });
      }

      if (patent.cs_filer_assgn === employeeName) {
        let status = 'Drafting';
        if (currentStatus === 'cs_filing_approval') status = 'Review';
        else if (['cs_completed', 'completed'].includes(currentStatus)) status = 'Completed';
        else if (currentStatus === 'cs_data_sent' && patent.pending_cs_confirmation) status = 'Pending Confirmation';
        else if (currentStatus === 'cs_data_sent' && !patent.cs_data_received) status = 'Pending Information';
        
        tasks.push({
          type: 'CS Filer',
          status,
          deadline: patent.cs_filer_deadline
        });
      }

      if (patent.fer_drafter_assgn === employeeName) {
        let status = 'Drafting';
        if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1) status = 'Completed';
        else if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) status = 'Review';
        
        tasks.push({
          type: 'FER Drafter',
          status,
          deadline: patent.fer_drafter_deadline
        });
      }

      if (patent.fer_filer_assgn === employeeName) {
        let status = 'Drafting';
        if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 1) status = 'Completed';
        else if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0) status = 'Review';
        
        tasks.push({
          type: 'FER Filer',
          status,
          deadline: patent.fer_filer_deadline
        });
      }

      return { ...patent, tasks } as EnhancedPatent;
    });
  }, [patents, employeeName]);

  // Enhanced search functionality
  const handleSearch = (query: string, field?: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, taskTypeFilter, field);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, taskTypeFilter);
  };

  const handleTaskTypeFilter = (taskType: string | null) => {
    setTaskTypeFilter(taskType);
    applyFilters(searchQuery, statusFilter, taskType);
  };

  const applyFilters = (query: string, status: string | null, taskType: string | null, field?: string) => {
    let filtered = [...enhancedPatents];

    // Apply search query with field-specific search
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(patent => {
        if (field) {
          // Field-specific search
          switch (field) {
            case 'tracking_id':
              return patent.tracking_id.toLowerCase().includes(lowercaseQuery);
            case 'patent_title':
              return patent.patent_title.toLowerCase().includes(lowercaseQuery);
            case 'patent_applicant':
              return patent.patent_applicant.toLowerCase().includes(lowercaseQuery);
            case 'client_id':
              return patent.client_id.toLowerCase().includes(lowercaseQuery);
            case 'application_no':
              return patent.application_no?.toLowerCase().includes(lowercaseQuery) || false;
            case 'inventor_name':
              return patent.inventors?.some(inv => 
                inv.inventor_name.toLowerCase().includes(lowercaseQuery)
              ) || false;
            case 'inventor_email':
              return patent.inventor_email.toLowerCase().includes(lowercaseQuery);
            default:
              return true;
          }
        } else {
          // Global search across all fields
          return patent.tracking_id.toLowerCase().includes(lowercaseQuery) ||
                 patent.patent_title.toLowerCase().includes(lowercaseQuery) ||
                 patent.patent_applicant.toLowerCase().includes(lowercaseQuery) ||
                 patent.client_id.toLowerCase().includes(lowercaseQuery) ||
                 patent.application_no?.toLowerCase().includes(lowercaseQuery) ||
                 patent.inventor_email.toLowerCase().includes(lowercaseQuery) ||
                 patent.inventors?.some(inv => 
                   inv.inventor_name.toLowerCase().includes(lowercaseQuery)
                 );
        }
      });
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter(patent =>
        patent.tasks.some(task => task.status === status)
      );
    }

    // Apply task type filter
    if (taskType) {
      filtered = filtered.filter(patent =>
        patent.tasks.some(task => task.type === taskType)
      );
    }

    setFilteredPatents(filtered);
  };

  useEffect(() => {
    applyFilters(searchQuery, statusFilter, taskTypeFilter);
  }, [enhancedPatents, searchQuery, statusFilter, taskTypeFilter]);

  // Export to Excel functionality
  const handleExportToExcel = () => {
    if (filteredPatents.length === 0) {
      toast.error('No patents to export');
      return;
    }

    const exportData = filteredPatents.map(patent => ({
      'Tracking ID': patent.tracking_id,
      'Patent Applicant': patent.patent_applicant,
      'Client ID': patent.client_id,
      'Application No': patent.application_no || '',
      'Date of Filing': patent.date_of_filing ? format(new Date(patent.date_of_filing), 'dd/MM/yyyy') : '',
      'Patent Title': patent.patent_title,
      'Applicant Address': patent.applicant_addr,
      'Inventor Phone No': patent.inventor_ph_no || '',
      'Inventor Email': patent.inventor_email,
      'PS Drafter': patent.ps_drafter_assgn || '',
      'PS Filer': patent.ps_filer_assgn || '',
      'CS Drafter': patent.cs_drafter_assgn || '',
      'CS Filer': patent.cs_filer_assgn || '',
      'FER Drafter': patent.fer_drafter_assgn || '',
      'FER Filer': patent.fer_filer_assgn || '',
      'IDF Status': `${patent.idf_sent ? 'Sent' : 'Not Sent'} | ${patent.idf_received ? 'Received' : 'Not Received'}`,
      'CS Data Status': `${patent.cs_data ? 'Sent' : 'Not Sent'} | ${patent.cs_data_received ? 'Received' : 'Not Received'}`,
      'PS Drafting Status': patent.ps_drafting_status === 1 ? 'Completed' : 'Pending',
      'PS Filing Status': patent.ps_filing_status === 1 ? 'Completed' : 'Pending',
      'CS Drafting Status': patent.cs_drafting_status === 1 ? 'Completed' : 'Pending',
      'CS Filing Status': patent.cs_filing_status === 1 ? 'Completed' : 'Pending',
      'FER Status': patent.fer_status === 1 ? 'Active' : 'Inactive',
      'Inventors': patent.inventors?.map(inv => `${inv.inventor_name} - ${inv.inventor_addr}`).join('; ') || '',
      'Tasks Assigned': patent.tasks.map(task => task.type).join(', '),
      'Task Status': patent.tasks.map(task => `${task.type}: ${task.status}`).join('; '),
      'Deadlines': patent.tasks.filter(task => task.deadline).map(task => 
        `${task.type}: ${format(new Date(task.deadline!), 'dd/MM/yyyy')}`
      ).join('; ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${employeeName}_Patents`);
    
    XLSX.writeFile(workbook, `${employeeName}_Patents_Report.xlsx`);
    toast.success('Patent data exported successfully');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Review': return 'secondary';
      case 'Drafting': return 'outline';
      case 'Pending Confirmation': return 'outline';
      case 'Pending Information': return 'outline';
      default: return 'outline';
    }
  };

  const searchFields = [
    { value: 'tracking_id', label: 'Tracking ID' },
    { value: 'patent_title', label: 'Patent Title' },
    { value: 'patent_applicant', label: 'Patent Applicant' },
    { value: 'client_id', label: 'Client ID' },
    { value: 'application_no', label: 'Application No.' },
    { value: 'inventor_name', label: 'Inventor Name' },
    { value: 'inventor_email', label: 'Inventor Email' }
  ];

  if (!canViewDashboard) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {/* Only show back button for admin users */}
        {isAdmin && (
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">
              {isOwnDashboard ? 'My Dashboard' : employeeName}
            </h1>
            <p className="text-muted-foreground">
              {isOwnDashboard ? 'Personal Dashboard' : 'Employee Dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{employeeStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{employeeStats.drafting}</div>
            <div className="text-sm text-muted-foreground">Drafting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{employeeStats.review}</div>
            <div className="text-sm text-muted-foreground">Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{employeeStats.pendingConfirmation}</div>
            <div className="text-sm text-muted-foreground">Pending Confirmation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{employeeStats.pendingInformation}</div>
            <div className="text-sm text-muted-foreground">Pending Information</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{employeeStats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <SearchFilters
        onSearch={handleSearch}
        placeholder="Search patents by ID, title, applicant, client, inventor..."
        searchFields={searchFields}
        filters={[
          {
            name: 'Status',
            options: [
              { value: null, label: 'All Statuses' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Drafting', label: 'Drafting' },
              { value: 'Review', label: 'Review' },
              { value: 'Pending Confirmation', label: 'Pending Confirmation' },
              { value: 'Pending Information', label: 'Pending Information' }
            ],
            onFilter: handleStatusFilter,
            activeFilter: statusFilter
          },
          {
            name: 'Task Type',
            options: [
              { value: null, label: 'All Tasks' },
              { value: 'PS Drafter', label: 'PS Drafter' },
              { value: 'PS Filer', label: 'PS Filer' },
              { value: 'CS Drafter', label: 'CS Drafter' },
              { value: 'CS Filer', label: 'CS Filer' },
              { value: 'FER Drafter', label: 'FER Drafter' },
              { value: 'FER Filer', label: 'FER Filer' }
            ],
            onFilter: handleTaskTypeFilter,
            activeFilter: taskTypeFilter
          }
        ]}
      />

      {/* Patents Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Assigned Patents ({filteredPatents.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patent ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatents.map((patent) => (
                    <TableRow key={patent.id}>
                      <TableCell className="font-medium">{patent.tracking_id}</TableCell>
                      <TableCell className="max-w-xs truncate">{patent.patent_title}</TableCell>
                      <TableCell>{patent.client_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {patent.tasks.map((task, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {task.type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {patent.tasks.map((task, index) => (
                            <Badge key={index} variant={getStatusBadgeVariant(task.status)} className="text-xs">
                              {task.status}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patent.tasks
                          .filter(task => task.deadline)
                          .map((task, index) => (
                            <div key={index} className="text-xs">
                              {format(new Date(task.deadline!), 'MMM dd, yyyy')}
                            </div>
                          ))
                        }
                        {patent.tasks.every(task => !task.deadline) && (
                          <span className="text-muted-foreground text-xs">No deadline</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/patents/${patent.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No patents found matching the criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
