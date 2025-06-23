
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ patents }) => {
  const navigate = useNavigate();
  
  // Define the status types we want to track
  const statusTypes = ['Review', 'Completed', 'Drafting', 'Pending Confirmation', 'Pending Information'];
  
  // Calculate patent status counts based on actual patent status (not employee assignments)
  const patentStatusCounts = useMemo(() => {
    const counts = {
      'Review': 0,
      'Completed': 0,
      'Drafting': 0,
      'Pending Confirmation': 0,
      'Pending Information': 0,
      'Total': patents.length
    };
    
    patents.forEach(patent => {
      // Determine patent's current status based on priority
      let patentStatus = '';
      
      // Priority 1: Check for pending confirmation (highest priority)
      if (patent.pending_ps_confirmation || patent.pending_cs_confirmation) {
        patentStatus = 'Pending Confirmation';
      }
      // Priority 2: Check for pending information
      else if ((patent.idf_sent && !patent.idf_received) || (patent.cs_data && !patent.cs_data_received)) {
        patentStatus = 'Pending Information';
      }
      // Priority 3: Check for review status
      else if (
        (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) ||
        (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
        (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
        (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
        (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) ||
        (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0)
      ) {
        patentStatus = 'Review';
      }
      // Priority 4: Check for completed status
      else if (
        patent.ps_completion_status === 1 && 
        patent.cs_completion_status === 1 && 
        (patent.fer_status === 0 || patent.fer_completion_status === 1)
      ) {
        patentStatus = 'Completed';
      }
      // Priority 5: Default to drafting (work in progress)
      else {
        patentStatus = 'Drafting';
      }
      
      if (patentStatus && counts[patentStatus] !== undefined) {
        counts[patentStatus]++;
      }
    });
    
    return counts;
  }, [patents]);
  
  // Calculate employee workload for each status
  const employeeWorkload = useMemo(() => {
    const workload: Record<string, Record<string, number>> = {};
    
    // Get all unique employees
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
          'Review': 0,
          'Completed': 0,
          'Drafting': 0,
          'Pending Confirmation': 0,
          'Pending Information': 0,
          'Total': 0
        };
      }
    });
    
    // Count patents assigned to each employee
    patents.forEach(patent => {
      // Determine patent's current status
      let patentStatus = '';
      
      if (patent.pending_ps_confirmation || patent.pending_cs_confirmation) {
        patentStatus = 'Pending Confirmation';
      } else if ((patent.idf_sent && !patent.idf_received) || (patent.cs_data && !patent.cs_data_received)) {
        patentStatus = 'Pending Information';
      } else if (
        (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) ||
        (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) ||
        (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
        (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) ||
        (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) ||
        (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0)
      ) {
        patentStatus = 'Review';
      } else if (
        patent.ps_completion_status === 1 && 
        patent.cs_completion_status === 1 && 
        (patent.fer_status === 0 || patent.fer_completion_status === 1)
      ) {
        patentStatus = 'Completed';
      } else {
        patentStatus = 'Drafting';
      }
      
      // Find which employee is currently responsible for this patent
      let responsibleEmployee = '';
      
      // Determine who's currently working on this patent based on its stage
      if (patent.ps_completion_status === 0) {
        if (patent.ps_drafting_status === 0 && patent.ps_drafter_assgn) {
          responsibleEmployee = patent.ps_drafter_assgn;
        } else if (patent.ps_drafting_status === 1 && patent.ps_filing_status === 0 && patent.ps_filer_assgn) {
          responsibleEmployee = patent.ps_filer_assgn;
        }
      } else if (patent.cs_completion_status === 0) {
        if (patent.cs_drafting_status === 0 && patent.cs_drafter_assgn) {
          responsibleEmployee = patent.cs_drafter_assgn;
        } else if (patent.cs_drafting_status === 1 && patent.cs_filing_status === 0 && patent.cs_filer_assgn) {
          responsibleEmployee = patent.cs_filer_assgn;
        }
      } else if (patent.fer_status === 1 && patent.fer_completion_status === 0) {
        if (patent.fer_drafter_status === 0 && patent.fer_drafter_assgn) {
          responsibleEmployee = patent.fer_drafter_assgn;
        } else if (patent.fer_drafter_status === 1 && patent.fer_filing_status === 0 && patent.fer_filer_assgn) {
          responsibleEmployee = patent.fer_filer_assgn;
        }
      }
      
      // Count this patent for the responsible employee
      if (responsibleEmployee && workload[responsibleEmployee]) {
        workload[responsibleEmployee][patentStatus]++;
        workload[responsibleEmployee]['Total']++;
      }
    });
    
    return workload;
  }, [patents]);
  
  // Function to get the appropriate background color based on status
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'Review': return 'bg-gray-300 text-black';
      case 'Completed': return 'bg-green-500 text-white';
      case 'Drafting': return 'bg-yellow-400 text-black';
      case 'Pending Confirmation': return 'bg-orange-300 text-black';
      case 'Pending Information': return 'bg-purple-300 text-black';
      case 'Total': return 'bg-white text-black';
      default: return '';
    }
  };
  
  // Sort employees by total workload in descending order
  const sortedEmployees = useMemo(() => {
    return Object.keys(employeeWorkload).sort((a, b) => 
      employeeWorkload[b]['Total'] - employeeWorkload[a]['Total']
    );
  }, [employeeWorkload]);
  
  // Check if we have any data to show
  const hasData = sortedEmployees.length > 0;

  const handleEmployeeClick = (employeeName: string) => {
    navigate(`/employee/${encodeURIComponent(employeeName)}`);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="py-3 bg-blue-200">
        <CardTitle className="text-center text-lg font-bold">MAIN DASHBOARD</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Status</TableHead>
                  {sortedEmployees.map(employee => (
                    <TableHead key={employee} className="text-center font-bold">
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto font-bold text-foreground hover:text-primary"
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        {employee}
                      </Button>
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusTypes.map(status => (
                  <TableRow key={status} className={getBackgroundColor(status)}>
                    <TableCell className="font-bold">{status}</TableCell>
                    {sortedEmployees.map(employee => (
                      <TableCell 
                        key={`${employee}-${status}`} 
                        className="text-center"
                      >
                        {employeeWorkload[employee][status]}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {patentStatusCounts[status]}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className={getBackgroundColor('Total')}>
                  <TableCell className="font-bold">TOTAL</TableCell>
                  {sortedEmployees.map(employee => (
                    <TableCell 
                      key={`${employee}-total`} 
                      className="text-center font-bold"
                    >
                      {employeeWorkload[employee]['Total']}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">
                    {patentStatusCounts['Total']}
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
