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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedPatent extends Patent {
  tasks: {
    type: string;
    status: string;
    deadline?: string;
    responsibleFor: PatentStatus;
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

  // Calculate employee stats using the new allocation logic with proper CS stage breakdown
  const employeeStats = useMemo(() => {
    if (!employeeName) return { 
      psCompleted: 0, 
      csCompleted: 0, 
      completed: 0, 
      drafting: 0, 
      review: 0, 
      total: 0,
      psCompletedSubCounts: {},
      csCompletedSubCounts: {},
      completedSubCounts: {}
    };

    let psCompleted = 0;
    let csCompleted = 0;
    let completed = 0;
    let drafting = 0;
    let review = 0;

    // Track sub-status counts for tooltips
    const psCompletedSubCounts: Record<string, number> = {};
    const csCompletedSubCounts: Record<string, number> = {};
    const completedSubCounts: Record<string, number> = {};

    patents.forEach(patent => {
      const currentStatus = determinePatentStatus(patent);
      let responsibleEmployee = '';
      let countCategory = '';

      // Determine responsible employee and count category using the same logic as the main dashboard
      switch (currentStatus) {
        case 'idf_sent':
        case 'idf_received':
        case 'ps_drafting':
        case 'ps_drafting_approval':
          responsibleEmployee = patent.ps_drafter_assgn || '';
          countCategory = 'drafting';
          break;
          
        case 'ps_filing':
        case 'ps_filing_approval':
          responsibleEmployee = patent.ps_filer_assgn || '';
          countCategory = 'psCompleted';
          if (responsibleEmployee === employeeName) {
            psCompletedSubCounts[currentStatus] = (psCompletedSubCounts[currentStatus] || 0) + 1;
          }
          break;
          
        case 'ps_completed':
          responsibleEmployee = patent.ps_drafter_assgn || '';
          countCategory = 'psCompleted';
          if (responsibleEmployee === employeeName) {
            psCompletedSubCounts[currentStatus] = (psCompletedSubCounts[currentStatus] || 0) + 1;
          }
          break;
          
        case 'cs_data_sent':
        case 'cs_data_received':
        case 'cs_drafting':
        case 'cs_drafting_approval':
          responsibleEmployee = patent.cs_drafter_assgn || '';
          countCategory = 'drafting';
          break;
          
        case 'cs_filing':
        case 'cs_filing_approval':
          responsibleEmployee = patent.cs_filer_assgn || '';
          countCategory = 'csCompleted';
          if (responsibleEmployee === employeeName) {
            csCompletedSubCounts[currentStatus] = (csCompletedSubCounts[currentStatus] || 0) + 1;
          }
          break;
          
        case 'cs_completed':
          responsibleEmployee = patent.cs_drafter_assgn || '';
          countCategory = 'csCompleted';
          if (responsibleEmployee === employeeName) {
            csCompletedSubCounts[currentStatus] = (csCompletedSubCounts[currentStatus] || 0) + 1;
          }
          break;
          
        case 'completed':
          // FIXED: Completed patents go to CS drafter (last working drafter gets credit)
          responsibleEmployee = patent.cs_drafter_assgn || '';
          countCategory = 'completed';
          if (responsibleEmployee === employeeName) {
            // For completed patents, determine what CS stage they were in before completion
            let csStage = 'cs_completed'; // default
            
            if (patent.cs_filing_status === 1) {
              if (patent.cs_review_file_status === 1) {
                csStage = 'cs_filing_approval';
              } else {
                csStage = 'cs_filing';
              }
            } else if (patent.cs_drafting_status === 1) {
              if (patent.cs_review_draft_status === 1) {
                csStage = 'cs_drafting_approval';
              } else {
                csStage = 'cs_drafting';
              }
            } else if (patent.cs_data_received) {
              csStage = 'cs_data_received';
            } else if (patent.cs_data) {
              csStage = 'cs_data_sent';
            }
            
            completedSubCounts[csStage] = (completedSubCounts[csStage] || 0) + 1;
          }
          break;
      }

      // Count for this employee
      if (responsibleEmployee === employeeName) {
        switch (countCategory) {
          case 'psCompleted':
            psCompleted++;
            break;
          case 'csCompleted':
            csCompleted++;
            break;
          case 'completed':
            completed++;
            break;
          case 'drafting':
            drafting++;
            break;
          case 'review':
            review++;
            break;
        }
      }
    });

    return {
      psCompleted,
      csCompleted,
      completed,
      drafting,
      review,
      total: patents.length,
      psCompletedSubCounts,
      csCompletedSubCounts,
      completedSubCounts
    };
  }, [patents, employeeName]);

  // Enhanced patent data with task details using new logic
  const enhancedPatents = useMemo(() => {
    return patents.map(patent => {
      const tasks = [];
      const currentStatus = determinePatentStatus(patent);
      
      // Determine tasks and responsible employee using the new allocation logic
      switch (currentStatus) {
        case 'idf_sent':
        case 'idf_received':
        case 'ps_drafting':
        case 'ps_drafting_approval':
          if (patent.ps_drafter_assgn === employeeName) {
            tasks.push({
              type: 'PS Drafter',
              status: currentStatus === 'ps_drafting_approval' ? 'Review' : 'Drafting',
              deadline: patent.ps_drafter_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
          
        case 'ps_filing':
        case 'ps_filing_approval':
          if (patent.ps_filer_assgn === employeeName) {
            tasks.push({
              type: 'PS Filer',
              status: currentStatus === 'ps_filing_approval' ? 'Review' : 'Filing',
              deadline: patent.ps_filer_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
          
        case 'ps_completed':
          if (patent.ps_drafter_assgn === employeeName) {
            tasks.push({
              type: 'PS Drafter',
              status: 'PS Completed',
              deadline: patent.ps_drafter_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
          
        case 'cs_data_sent':
        case 'cs_data_received':
        case 'cs_drafting':
        case 'cs_drafting_approval':
          if (patent.cs_drafter_assgn === employeeName) {
            tasks.push({
              type: 'CS Drafter',
              status: currentStatus === 'cs_drafting_approval' ? 'Review' : 'Drafting',
              deadline: patent.cs_drafter_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
          
        case 'cs_filing':
        case 'cs_filing_approval':
          if (patent.cs_filer_assgn === employeeName) {
            tasks.push({
              type: 'CS Filer',
              status: currentStatus === 'cs_filing_approval' ? 'Review' : 'Filing',
              deadline: patent.cs_filer_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
          
        case 'cs_completed':
          if (patent.cs_drafter_assgn === employeeName) {
            tasks.push({
              type: 'CS Drafter',
              status: 'CS Completed',
              deadline: patent.cs_drafter_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
          
        case 'completed':
          // Completed patents show for CS drafter (last working drafter gets credit)
          if (patent.cs_drafter_assgn === employeeName) {
            tasks.push({
              type: 'CS Drafter',
              status: 'Completed',
              deadline: patent.cs_drafter_deadline,
              responsibleFor: currentStatus
            });
          }
          break;
      }

      // Add FER tasks if applicable
      if (patent.fer_drafter_assgn === employeeName) {
        let status = 'Drafting';
        if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1) status = 'Completed';
        else if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) status = 'Review';
        
        tasks.push({
          type: 'FER Drafter',
          status,
          deadline: patent.fer_drafter_deadline,
          responsibleFor: 'fer_drafting' as PatentStatus
        });
      }

      if (patent.fer_filer_assgn === employeeName) {
        let status = 'Drafting';
        if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 1) status = 'Completed';
        else if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0) status = 'Review';
        
        tasks.push({
          type: 'FER Filer',
          status,
          deadline: patent.fer_filer_deadline,
          responsibleFor: 'fer_filing' as PatentStatus
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
      'Current Status': determinePatentStatus(patent),
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
      case 'Completed': 
      case 'PS Completed':
      case 'CS Completed':
        return 'success';
      case 'Review': return 'secondary';
      case 'Drafting': 
      case 'Filing':
        return 'outline';
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

  // Helper function to format sub-status counts for tooltips
  const formatSubCounts = (subCounts: Record<string, number>) => {
    return Object.entries(subCounts)
      .map(([status, count]) => `${status.replace(/_/g, ' ')}: ${count}`)
      .join('\n');
  };

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
    <TooltipProvider>
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

        {/* Summary Stats with Tooltips */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{employeeStats.psCompleted}</div>
                  <div className="text-sm text-muted-foreground">PS Completed</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="whitespace-pre-line">
                {formatSubCounts(employeeStats.psCompletedSubCounts) || 'No sub-statuses'}
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{employeeStats.csCompleted}</div>
                  <div className="text-sm text-muted-foreground">CS Completed</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="whitespace-pre-line">
                {formatSubCounts(employeeStats.csCompletedSubCounts) || 'No sub-statuses'}
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{employeeStats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="whitespace-pre-line">
                {formatSubCounts(employeeStats.completedSubCounts) || 'No sub-statuses'}
              </div>
            </TooltipContent>
          </Tooltip>

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
              <div className="text-2xl font-bold text-purple-600">{employeeStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Assigned</div>
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
                { value: 'PS Completed', label: 'PS Completed' },
                { value: 'CS Completed', label: 'CS Completed' },
                { value: 'Drafting', label: 'Drafting' },
                { value: 'Filing', label: 'Filing' },
                { value: 'Review', label: 'Review' }
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
    </TooltipProvider>
  );
};

export default EmployeeDashboard;
