
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { determinePatentStatus, PatentStatus, STATUS_LABELS, getStatusCounts, STATUS_COLORS } from '@/lib/utils/status-utils';

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
  
  // Calculate employee workload with corrected stage-based allocation
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
    
    // Count patents assigned to each employee based on stage groupings
    patents.forEach(patent => {
      const patentStatus = determinePatentStatus(patent);
      
      // PS stages: all stages up to and including ps_completed go to PS drafter
      const psStages: PatentStatus[] = [
        'ps_drafting', 
        'ps_drafting_approval', 
        'ps_filing', 
        'ps_filing_approval', 
        'ps_completed'
      ];
      
      // CS stages: all stages from cs_data_sent onwards go to CS drafter
      const csStages: PatentStatus[] = [
        'cs_data_sent',
        'cs_data_received',
        'cs_drafting',
        'cs_drafting_approval',
        'cs_filing',
        'cs_filing_approval',
        'cs_completed',
        'completed'
      ];
      
      let responsibleEmployee = '';
      
      if (psStages.includes(patentStatus)) {
        // PS stages go to PS drafter
        responsibleEmployee = patent.ps_drafter_assgn || '';
      } else if (csStages.includes(patentStatus)) {
        // CS stages go to CS drafter
        responsibleEmployee = patent.cs_drafter_assgn || '';
      }
      // Admin stages (idf_sent, idf_received, withdrawn) don't get assigned to specific employees
      
      // Count this patent for the responsible employee
      if (responsibleEmployee && workload[responsibleEmployee]) {
        workload[responsibleEmployee][patentStatus]++;
      }
    });
    
    return workload;
  }, [patents]);
  
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
          Stage-based Allocation: PS stages → PS drafter, CS stages → CS drafter (Total Patents: {patents.length}, Status Total: {totalFromStatus})
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
