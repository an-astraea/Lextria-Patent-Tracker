
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
  
  // Calculate employee stats based on patents
  const employeeStats = useMemo(() => {
    const stats: Record<string, { [key: string]: number }> = {};
    
    // Get all unique employees assigned to any patents
    const allEmployees = new Set<string>();
    
    patents.forEach(patent => {
      if (patent.ps_drafter_assgn) allEmployees.add(patent.ps_drafter_assgn);
      if (patent.ps_filer_assgn) allEmployees.add(patent.ps_filer_assgn);
      if (patent.cs_drafter_assgn) allEmployees.add(patent.cs_drafter_assgn);
      if (patent.cs_filer_assgn) allEmployees.add(patent.cs_filer_assgn);
      if (patent.fer_drafter_assgn) allEmployees.add(patent.fer_drafter_assgn);
      if (patent.fer_filer_assgn) allEmployees.add(patent.fer_filer_assgn);
    });
    
    // Initialize stats object with all employees
    allEmployees.forEach(employee => {
      if (employee) {
        stats[employee] = {
          'Review': 0,
          'Completed': 0,
          'Drafting': 0,
          'Pending Confirmation': 0,
          'Pending Information': 0,
          'Total': 0
        };
      }
    });
    
    // Process each patent and determine its primary status for each employee
    patents.forEach(patent => {
      // Function to determine patent status for a specific employee and role
      const getPatentStatusForEmployee = (employeeName: string, role: 'ps_drafter' | 'ps_filer' | 'cs_drafter' | 'cs_filer' | 'fer_drafter' | 'fer_filer') => {
        // Check if this employee is assigned to this role
        let isAssigned = false;
        let currentTask = '';
        
        switch (role) {
          case 'ps_drafter':
            isAssigned = patent.ps_drafter_assgn === employeeName;
            currentTask = 'ps_drafting';
            break;
          case 'ps_filer':
            isAssigned = patent.ps_filer_assgn === employeeName && patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 1;
            currentTask = 'ps_filing';
            break;
          case 'cs_drafter':
            isAssigned = patent.cs_drafter_assgn === employeeName && patent.ps_completion_status === 1;
            currentTask = 'cs_drafting';
            break;
          case 'cs_filer':
            isAssigned = patent.cs_filer_assgn === employeeName && patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 1;
            currentTask = 'cs_filing';
            break;
          case 'fer_drafter':
            isAssigned = patent.fer_drafter_assgn === employeeName && patent.fer_status === 1;
            currentTask = 'fer_drafting';
            break;
          case 'fer_filer':
            isAssigned = patent.fer_filer_assgn === employeeName && patent.fer_status === 1 && patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1;
            currentTask = 'fer_filing';
            break;
        }
        
        if (!isAssigned) return null;
        
        // Priority 1: Check for pending confirmation (highest priority)
        if (patent.pending_ps_confirmation && (role === 'ps_drafter' || role === 'ps_filer')) {
          return 'Pending Confirmation';
        }
        if (patent.pending_cs_confirmation && (role === 'cs_drafter' || role === 'cs_filer')) {
          return 'Pending Confirmation';
        }
        
        // Priority 2: Check for pending information
        if (patent.idf_sent && !patent.idf_received && (role === 'ps_drafter' || role === 'ps_filer')) {
          return 'Pending Information';
        }
        if (patent.cs_data && !patent.cs_data_received && (role === 'cs_drafter' || role === 'cs_filer')) {
          return 'Pending Information';
        }
        
        // Priority 3: Check for review status
        if (role === 'ps_drafter' && patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) {
          return 'Review';
        }
        if (role === 'ps_filer' && patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) {
          return 'Review';
        }
        if (role === 'cs_drafter' && patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) {
          return 'Review';
        }
        if (role === 'cs_filer' && patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) {
          return 'Review';
        }
        if (role === 'fer_drafter' && patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) {
          return 'Review';
        }
        if (role === 'fer_filer' && patent.fer_filing_status === 1 && patent.fer_review_file_status === 0) {
          return 'Review';
        }
        
        // Priority 4: Check for completed status
        if (role === 'ps_drafter' && patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 1) {
          return 'Completed';
        }
        if (role === 'ps_filer' && patent.ps_filing_status === 1 && patent.ps_review_file_status === 1) {
          return 'Completed';
        }
        if (role === 'cs_drafter' && patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 1) {
          return 'Completed';
        }
        if (role === 'cs_filer' && patent.cs_filing_status === 1 && patent.cs_review_file_status === 1) {
          return 'Completed';
        }
        if (role === 'fer_drafter' && patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1) {
          return 'Completed';
        }
        if (role === 'fer_filer' && patent.fer_filing_status === 1 && patent.fer_review_file_status === 1) {
          return 'Completed';
        }
        
        // Priority 5: Default to drafting (work in progress)
        return 'Drafting';
      };
      
      // Process each employee and their roles
      allEmployees.forEach(employeeName => {
        if (!employeeName) return;
        
        const roles: Array<'ps_drafter' | 'ps_filer' | 'cs_drafter' | 'cs_filer' | 'fer_drafter' | 'fer_filer'> = [
          'ps_drafter', 'ps_filer', 'cs_drafter', 'cs_filer', 'fer_drafter', 'fer_filer'
        ];
        
        // Find the current active status for this employee on this patent
        let activeStatus: string | null = null;
        
        for (const role of roles) {
          const status = getPatentStatusForEmployee(employeeName, role);
          if (status) {
            // Use the first (highest priority) active status found
            activeStatus = status;
            break;
          }
        }
        
        // Count the patent for this employee if they have an active status
        if (activeStatus && stats[employeeName]) {
          stats[employeeName][activeStatus]++;
          stats[employeeName]['Total']++;
        }
      });
    });
    
    return stats;
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
  
  // Sort employees by total count in descending order
  const sortedEmployees = useMemo(() => {
    return Object.keys(employeeStats).sort((a, b) => 
      employeeStats[b]['Total'] - employeeStats[a]['Total']
    );
  }, [employeeStats]);
  
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
                        {employeeStats[employee][status]}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {sortedEmployees.reduce(
                        (sum, employee) => sum + employeeStats[employee][status], 
                        0
                      )}
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
                      {employeeStats[employee]['Total']}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">
                    {sortedEmployees.reduce(
                      (sum, employee) => sum + employeeStats[employee]['Total'], 
                      0
                    )}
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
