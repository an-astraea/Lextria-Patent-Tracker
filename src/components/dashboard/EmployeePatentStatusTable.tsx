
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { determinePatentStatus, PatentStatus, STATUS_LABELS, getStatusCounts, STATUS_COLORS } from '@/lib/utils/status-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchEmployees } from '@/lib/api/employee-api';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ patents }) => {
  const navigate = useNavigate();
  const [employees, setEmployees] = React.useState<any[]>([]);
  
  // Fetch employees to get their roles
  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeeData = await fetchEmployees();
        setEmployees(employeeData);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    loadEmployees();
  }, []);
  
  // Helper function to check if an employee is a filer
  const isEmployeeFiler = (employeeName: string): boolean => {
    const employee = employees.find(emp => emp.full_name === employeeName);
    return employee?.role === 'filer';
  };
  
  // All 16 statuses in workflow order
  const allStatuses: PatentStatus[] = [
    'idf_sent',
    'idf_received',
    'ps_drafting',
    'ps_drafting_approval',
    'ps_filing',
    'ps_filing_approval',
    'ps_completed',
    'cs_data_sent',
    'cs_data_received',
    'cs_drafting',
    'cs_drafting_approval',
    'cs_filing',
    'cs_filing_approval',
    'cs_completed',
    'completed',
    'withdrawn'
  ];

  // Custom labels for display
  const DISPLAY_LABELS: Record<PatentStatus, string> = {
    ...STATUS_LABELS,
    'ps_completed': 'PS Completed',
    'cs_completed': 'CS Completed'
  };

  // Calculate overall status counts using the corrected logic
  const statusCounts = useMemo(() => {
    return getStatusCounts(patents);
  }, [patents]);

  // Calculate sub-status counts for completed statuses with proper CS stage breakdown
  const subStatusCounts = useMemo(() => {
    const psCompletedSubs: Record<string, number> = {};
    const csCompletedSubs: Record<string, number> = {};
    const completedSubs: Record<string, number> = {};

    patents.forEach(patent => {
      const status = determinePatentStatus(patent);
      
      if (['ps_filing', 'ps_filing_approval', 'ps_completed'].includes(status)) {
        psCompletedSubs[status] = (psCompletedSubs[status] || 0) + 1;
      }
      
      if (['cs_filing', 'cs_filing_approval', 'cs_completed'].includes(status)) {
        csCompletedSubs[status] = (csCompletedSubs[status] || 0) + 1;
      }
      
      // For completed patents, determine what CS stage they were in before completion
      if (status === 'completed') {
        // Check the actual CS stage fields to determine what stage this patent was in
        let csStage = 'cs_completed'; // default
        
        // Determine the CS stage based on CS section status fields
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
        
        completedSubs[csStage] = (completedSubs[csStage] || 0) + 1;
      }
    });

    return { psCompletedSubs, csCompletedSubs, completedSubs };
  }, [patents]);
  
  // Calculate employee workload with detailed stage-based allocation, excluding filers
  const employeeWorkload = useMemo(() => {
    const workload: Record<string, Record<PatentStatus, number>> = {};
    
    // Get all unique employees from all assignment fields, excluding filers
    const allEmployees = new Set<string>();
    patents.forEach(patent => {
      [
        patent.ps_drafter_assgn,
        patent.cs_drafter_assgn,
        patent.fer_drafter_assgn
      ].filter(Boolean).forEach(employeeName => {
        if (employeeName && !isEmployeeFiler(employeeName)) {
          allEmployees.add(employeeName);
        }
      });
    });
    
    // Initialize workload for each non-filer employee
    allEmployees.forEach(employee => {
      if (employee) {
        workload[employee] = {
          'idf_sent': 0,
          'idf_received': 0,
          'ps_drafting': 0,
          'ps_drafting_approval': 0,
          'ps_filing': 0,
          'ps_filing_approval': 0,
          'ps_completed': 0,
          'cs_data_sent': 0,
          'cs_data_received': 0,
          'cs_drafting': 0,
          'cs_drafting_approval': 0,
          'cs_filing': 0,
          'cs_filing_approval': 0,
          'cs_completed': 0,
          'completed': 0,
          'withdrawn': 0
        };
      }
    });
    
    // Count patents assigned to each employee based on detailed stage allocation, excluding filers
    patents.forEach(patent => {
      const patentStatus = determinePatentStatus(patent);
      
      let responsibleEmployee = '';
      let countStatus = patentStatus;
      
      switch (patentStatus) {
        case 'idf_sent':
        case 'idf_received':
          // IDF stages go to PS drafter (only if not a filer)
          responsibleEmployee = patent.ps_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          break;
          
        case 'ps_drafting':
        case 'ps_drafting_approval':
          // PS drafting stages go to PS drafter (only if not a filer)
          responsibleEmployee = patent.ps_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          break;
          
        case 'ps_filing':
        case 'ps_filing_approval':
          // PS filing stages - don't show filers, show as PS drafter's responsibility
          responsibleEmployee = patent.ps_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          countStatus = 'ps_completed';
          break;
          
        case 'ps_completed':
          // PS completed goes to PS drafter (only if not a filer)
          responsibleEmployee = patent.ps_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          break;
          
        case 'cs_data_sent':
        case 'cs_data_received':
          // CS data stages go to CS drafter (only if not a filer)
          responsibleEmployee = patent.cs_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          break;
          
        case 'cs_drafting':
        case 'cs_drafting_approval':
          // CS drafting stages go to CS drafter (only if not a filer)
          responsibleEmployee = patent.cs_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          break;
          
        case 'cs_filing':
        case 'cs_filing_approval':
          // CS filing stages - don't show filers, show as CS drafter's responsibility
          responsibleEmployee = patent.cs_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          countStatus = 'cs_completed';
          break;
          
        case 'cs_completed':
          // CS completed goes to CS drafter (only if not a filer)
          responsibleEmployee = patent.cs_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          break;
          
        case 'completed':
          // Completed patents go to CS drafter (only if not a filer)
          responsibleEmployee = patent.cs_drafter_assgn || '';
          if (isEmployeeFiler(responsibleEmployee)) responsibleEmployee = '';
          countStatus = 'completed';
          break;
          
        case 'withdrawn':
          // Withdrawn patents don't get assigned to specific employees
          break;
      }
      
      // Count this patent for the responsible employee under the appropriate status
      if (responsibleEmployee && workload[responsibleEmployee]) {
        workload[responsibleEmployee][countStatus]++;
      }
    });
    
    return workload;
  }, [patents, employees]);
  
  // Sort employees by total workload
  const sortedEmployees = useMemo(() => {
    return Object.keys(employeeWorkload).sort((a, b) => {
      const totalA = allStatuses.reduce((sum, status) => sum + employeeWorkload[a][status], 0);
      const totalB = allStatuses.reduce((sum, status) => sum + employeeWorkload[b][status], 0);
      return totalB - totalA;
    });
  }, [employeeWorkload, allStatuses]);
  
  // Check if we have any data to show
  const hasData = sortedEmployees.length > 0;

  const handleEmployeeClick = (employeeName: string) => {
    navigate(`/employee/${encodeURIComponent(employeeName)}`);
  };

  // Filter statuses to show only those with data
  const visibleStatuses = allStatuses.filter(status => 
    statusCounts[status] > 0 || 
    sortedEmployees.some(emp => employeeWorkload[emp][status] > 0)
  );

  // Validation: Check if total counts match
  const totalFromStatus = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  // Helper function to format sub-status counts for tooltips
  const formatSubCounts = (subCounts: Record<string, number>) => {
    return Object.entries(subCounts)
      .map(([status, count]) => `${status.replace(/_/g, ' ')}: ${count}`)
      .join('\n');
  };

  // Check if a status should have a tooltip
  const shouldShowTooltip = (status: PatentStatus) => {
    return ['ps_completed', 'cs_completed', 'completed'].includes(status);
  };

  // Get tooltip content for a status
  const getTooltipContent = (status: PatentStatus) => {
    switch (status) {
      case 'ps_completed':
        return formatSubCounts(subStatusCounts.psCompletedSubs);
      case 'cs_completed':
        return formatSubCounts(subStatusCounts.csCompletedSubs);
      case 'completed':
        return formatSubCounts(subStatusCounts.completedSubs);
      default:
        return '';
    }
  };
  
  return (
    <TooltipProvider>
      <Card className="col-span-full">
        <CardHeader className="py-3 bg-blue-200">
          <CardTitle className="text-center text-lg font-bold">MAIN DASHBOARD - PATENT STATUS BY EMPLOYEE (DRAFTERS ONLY)</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Detailed Allocation: IDF→PS drafter, PS filing→PS drafter, CS data→CS drafter, CS filing→CS drafter, Completed→CS drafter (Total Patents: {patents.length}, Status Total: {totalFromStatus})
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {hasData ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold sticky left-0 bg-background z-10 min-w-[200px]">
                      Status
                    </TableHead>
                    {sortedEmployees.map(employee => (
                      <TableHead key={employee} className="text-center font-bold min-w-[120px]">
                        <Button 
                          variant="ghost" 
                          className="p-0 h-auto font-bold text-foreground text-xs"
                          onClick={() => handleEmployeeClick(employee)}
                        >
                          {employee}
                        </Button>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold min-w-[80px]">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStatuses.map(status => (
                    <TableRow key={status} className={STATUS_COLORS[status]}>
                      <TableCell className="font-bold sticky left-0 bg-inherit z-10">
                        <div className="min-w-[180px]">
                          <div className="font-semibold capitalize">
                            {status === 'ps_completed' ? 'PS Completed' : 
                             status === 'cs_completed' ? 'CS Completed' :
                             status === 'ps_drafting' ? 'PS Drafted' :
                             status.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {DISPLAY_LABELS[status]}
                          </div>
                        </div>
                      </TableCell>
                      {sortedEmployees.map(employee => (
                        <TableCell 
                          key={`${employee}-${status}`} 
                          className="text-center font-medium"
                        >
                          {employeeWorkload[employee][status] || 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold">
                        {shouldShowTooltip(status) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help underline decoration-dotted">
                                {statusCounts[status]}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="whitespace-pre-line">
                                {getTooltipContent(status) || 'No sub-statuses'}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          statusCounts[status]
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-100 font-bold border-t-2">
                    <TableCell className="font-bold sticky left-0 bg-gray-100 z-10">
                      TOTAL ASSIGNED
                    </TableCell>
                    {sortedEmployees.map(employee => (
                      <TableCell 
                        key={`${employee}-total`} 
                        className="text-center font-bold"
                      >
                        {allStatuses.reduce((sum, status) => sum + employeeWorkload[employee][status], 0)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {patents.length}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No patent data available</p>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EmployeePatentStatusTable;
