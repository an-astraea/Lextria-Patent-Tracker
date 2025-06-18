
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { Patent } from '@/lib/types';
import { fetchPatents } from '@/lib/api';
import { toast } from 'sonner';
import SearchFilters from '@/components/common/SearchFilters';
import PatentCard from '@/components/PatentCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const { employeeName } = useParams<{ employeeName: string }>();
  const navigate = useNavigate();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | null>(null);

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
        setFilteredPatents(employeePatents);
      } catch (error) {
        console.error('Error fetching employee patents:', error);
        toast.error('Failed to load employee patents');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeePatents();
  }, [employeeName]);

  // Calculate employee stats
  const employeeStats = useMemo(() => {
    if (!employeeName) return { completed: 0, drafting: 0, review: 0, pendingConfirmation: 0, pendingInformation: 0, total: 0 };

    let completed = 0;
    let drafting = 0;
    let review = 0;
    let pendingConfirmation = 0;
    let pendingInformation = 0;

    patents.forEach(patent => {
      let hasTask = false;

      // PS Drafter tasks
      if (patent.ps_drafter_assgn === employeeName) {
        hasTask = true;
        if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 1) {
          completed++;
        } else if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) {
          review++;
        } else if (patent.pending_ps_confirmation) {
          pendingConfirmation++;
        } else if (!patent.idf_received && patent.idf_sent) {
          pendingInformation++;
        } else {
          drafting++;
        }
      }

      // PS Filer tasks
      if (patent.ps_filer_assgn === employeeName && patent.ps_drafting_status === 1) {
        hasTask = true;
        if (patent.ps_filing_status === 1 && patent.ps_review_file_status === 1) {
          completed++;
        } else if (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) {
          review++;
        } else if (patent.pending_ps_confirmation) {
          pendingConfirmation++;
        } else if (!patent.idf_received && patent.idf_sent) {
          pendingInformation++;
        } else {
          drafting++;
        }
      }

      // CS Drafter tasks
      if (patent.cs_drafter_assgn === employeeName && patent.ps_filing_status === 1) {
        hasTask = true;
        if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 1) {
          completed++;
        } else if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) {
          review++;
        } else if (patent.pending_cs_confirmation) {
          pendingConfirmation++;
        } else if (!patent.idf_received && patent.idf_sent) {
          pendingInformation++;
        } else {
          drafting++;
        }
      }

      // CS Filer tasks
      if (patent.cs_filer_assgn === employeeName && patent.cs_drafting_status === 1) {
        hasTask = true;
        if (patent.cs_filing_status === 1 && patent.cs_review_file_status === 1) {
          completed++;
        } else if (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) {
          review++;
        } else if (patent.pending_cs_confirmation) {
          pendingConfirmation++;
        } else if (!patent.idf_received && patent.idf_sent) {
          pendingInformation++;
        } else {
          drafting++;
        }
      }

      // FER tasks
      if (patent.fer_status === 1) {
        if (patent.fer_drafter_assgn === employeeName) {
          hasTask = true;
          if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1) {
            completed++;
          } else if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) {
            review++;
          } else {
            drafting++;
          }
        }

        if (patent.fer_filer_assgn === employeeName && patent.fer_drafter_status === 1) {
          hasTask = true;
          if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 1) {
            completed++;
          } else if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0) {
            review++;
          } else {
            drafting++;
          }
        }
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
      
      if (patent.ps_drafter_assgn === employeeName) {
        tasks.push({
          type: 'PS Drafter',
          status: patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 1 ? 'Completed' :
                  patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0 ? 'Review' :
                  patent.pending_ps_confirmation ? 'Pending Confirmation' :
                  !patent.idf_received && patent.idf_sent ? 'Pending Information' : 'Drafting',
          deadline: patent.ps_drafter_deadline
        });
      }

      if (patent.ps_filer_assgn === employeeName) {
        tasks.push({
          type: 'PS Filer',
          status: patent.ps_filing_status === 1 && patent.ps_review_file_status === 1 ? 'Completed' :
                  patent.ps_filing_status === 1 && patent.ps_review_file_status === 0 ? 'Review' :
                  patent.pending_ps_confirmation ? 'Pending Confirmation' :
                  !patent.idf_received && patent.idf_sent ? 'Pending Information' : 'Drafting',
          deadline: patent.ps_filer_deadline
        });
      }

      if (patent.cs_drafter_assgn === employeeName) {
        tasks.push({
          type: 'CS Drafter',
          status: patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 1 ? 'Completed' :
                  patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0 ? 'Review' :
                  patent.pending_cs_confirmation ? 'Pending Confirmation' :
                  !patent.idf_received && patent.idf_sent ? 'Pending Information' : 'Drafting',
          deadline: patent.cs_drafter_deadline
        });
      }

      if (patent.cs_filer_assgn === employeeName) {
        tasks.push({
          type: 'CS Filer',
          status: patent.cs_filing_status === 1 && patent.cs_review_file_status === 1 ? 'Completed' :
                  patent.cs_filing_status === 1 && patent.cs_review_file_status === 0 ? 'Review' :
                  patent.pending_cs_confirmation ? 'Pending Confirmation' :
                  !patent.idf_received && patent.idf_sent ? 'Pending Information' : 'Drafting',
          deadline: patent.cs_filer_deadline
        });
      }

      if (patent.fer_drafter_assgn === employeeName) {
        tasks.push({
          type: 'FER Drafter',
          status: patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1 ? 'Completed' :
                  patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0 ? 'Review' : 'Drafting',
          deadline: patent.fer_drafter_deadline
        });
      }

      if (patent.fer_filer_assgn === employeeName) {
        tasks.push({
          type: 'FER Filer',
          status: patent.fer_filing_status === 1 && patent.fer_review_file_status === 1 ? 'Completed' :
                  patent.fer_filing_status === 1 && patent.fer_review_file_status === 0 ? 'Review' : 'Drafting',
          deadline: patent.fer_filer_deadline
        });
      }

      return { ...patent, tasks };
    });
  }, [patents, employeeName]);

  // Search and filter functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, taskTypeFilter);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, taskTypeFilter);
  };

  const handleTaskTypeFilter = (taskType: string | null) => {
    setTaskTypeFilter(taskType);
    applyFilters(searchQuery, statusFilter, taskType);
  };

  const applyFilters = (query: string, status: string | null, taskType: string | null) => {
    let filtered = [...enhancedPatents];

    // Apply search query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(patent =>
        patent.tracking_id.toLowerCase().includes(lowercaseQuery) ||
        patent.patent_title.toLowerCase().includes(lowercaseQuery) ||
        patent.patent_applicant.toLowerCase().includes(lowercaseQuery) ||
        patent.client_id.toLowerCase().includes(lowercaseQuery)
      );
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

  if (user?.role !== 'admin') {
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">{employeeName}</h1>
            <p className="text-muted-foreground">Employee Dashboard</p>
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

      {/* Search and Filters */}
      <SearchFilters
        onSearch={handleSearch}
        placeholder="Search patents by ID, title, applicant, or client..."
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
          <CardTitle>Assigned Patents ({filteredPatents.length})</CardTitle>
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
