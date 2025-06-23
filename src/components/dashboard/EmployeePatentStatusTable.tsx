
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { determinePatentStatus, PatentStatus, STATUS_LABELS, getStatusCounts } from '@/lib/utils/status-utils';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ patents }) => {
  const navigate = useNavigate();
  
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

  // Calculate overall status counts using the corrected logic
  const statusCounts = useMemo(() => {
    return getStatusCounts(patents);
  }, [patents]);
  
  // Calculate employee workload for each status
  const employeeWorkload = useMemo(() => {
    const workload: Record<string, Record<PatentStatus, number>> = {};
    
    // Get all unique employees from all assignment fields
    const allEmployees = new Set<string>();
    patents.forEach(patent => {
      if (patent.ps_drafter_assgn) allEmployees.add(patent.ps_drafter_assgn);
      if (patent.ps_filer_assgn) allEmployees.add(patent.ps_filer_assgn);
      if (patent.cs_drafter_assgn) allEmployees.add(patent.cs_drafter_assgn);
      if (patent.cs_filer_assgn) allEmployees.add(patent.cs_filer_assgn);
      if (patent.fer_drafter_assgn) allEmployees.add(patent.fer_drafter_assgn);
      if (patent.fer_filer_assgn) allEmployees.add(patent.fer_filer_assgn);
    });
    
    // Initialize workload for each employee
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
    
    // Count patents assigned to each employee based on current status
    patents.forEach(patent => {
      const patentStatus = determinePatentStatus(patent);
      
      // Determine which employee is currently responsible based on patent status
      let responsibleEmployee = '';
      
      switch (patentStatus) {
        case 'idf_sent':
        case 'idf_received':
          // Admin responsibility - no specific employee assignment yet
          break;
        case 'ps_drafting':
          responsibleEmployee = patent.ps_drafter_assgn || '';
          break;
        case 'ps_drafting_approval':
          // Admin reviews PS drafts - no employee assignment
          break;
        case 'ps_filing':
          responsibleEmployee = patent.ps_filer_assgn || '';
          break;
        case 'ps_filing_approval':
          // Admin reviews PS filing - no employee assignment
          break;
        case 'ps_completed':
        case 'cs_data_sent':
        case 'cs_data_received':
          // Admin responsibility for CS data management
          break;
        case 'cs_drafting':
          responsibleEmployee = patent.cs_drafter_assgn || '';
          break;
        case 'cs_drafting_approval':
          // Admin reviews CS drafts - no employee assignment
          break;
        case 'cs_filing':
          responsibleEmployee = patent.cs_filer_assgn || '';
          break;
        case 'cs_filing_approval':
          // Admin reviews CS filing - no employee assignment
          break;
        case 'cs_completed':
        case 'completed':
        case 'withdrawn':
          // Final states - no specific employee responsibility
          break;
      }
      
      // Count this patent for the responsible employee
      if (responsibleEmployee && workload[responsibleEmployee]) {
        workload[responsibleEmployee][patentStatus]++;
      }
    });
    
    return workload;
  }, [patents]);
  
  // Function to get background color based on status
  const getStatusColor = (status: PatentStatus) => {
    switch (status) {
      case 'idf_sent': return 'bg-gray-100';
      case 'idf_received': return 'bg-blue-50';
      case 'ps_drafting': return 'bg-blue-100';
      case 'ps_drafting_approval': return 'bg-blue-200';
      case 'ps_filing': return 'bg-blue-300';
      case 'ps_filing_approval': return 'bg-blue-400';
      case 'ps_completed': return 'bg-blue-500 text-white';
      case 'cs_data_sent': return 'bg-indigo-100';
      case 'cs_data_received': return 'bg-indigo-200';
      case 'cs_drafting': return 'bg-indigo-300';
      case 'cs_drafting_approval': return 'bg-indigo-400';
      case 'cs_filing': return 'bg-indigo-500 text-white';
      case 'cs_filing_approval': return 'bg-indigo-600 text-white';
      case 'cs_completed': return 'bg-indigo-700 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'withdrawn': return 'bg-red-500 text-white';
      default: return 'bg-gray-50';
    }
  };
  
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
  
  return (
    <Card className="col-span-full">
      <CardHeader className="py-3 bg-blue-200">
        <CardTitle className="text-center text-lg font-bold">MAIN DASHBOARD - PATENT STATUS BY EMPLOYEE</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Linear Workflow: Each patent counted once in its current status (Total Patents: {patents.length}, Status Total: {totalFromStatus})
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
                        className="p-0 h-auto font-bold text-foreground hover:text-primary text-xs"
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
                  <TableRow key={status} className={getStatusColor(status)}>
                    <TableCell className="font-bold sticky left-0 bg-inherit z-10">
                      <div className="min-w-[180px]">
                        <div className="font-semibold capitalize">
                          {status.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {STATUS_LABELS[status]}
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
                      {statusCounts[status]}
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
  );
};

export default EmployeePatentStatusTable;
