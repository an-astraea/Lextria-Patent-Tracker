
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ patents }) => {
  // Define the status types we want to track
  const statusTypes = ['Review', 'Completed', 'Drafting', 'Pending'];
  
  // Calculate employee stats based on patents
  const employeeStats = useMemo(() => {
    const stats: Record<string, { [key: string]: number }> = {};
    
    // Initialize with all employees who are assigned to any patents
    const allEmployees = new Set<string>();
    
    patents.forEach(patent => {
      // Add all assigned employees to the set
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
          'Pending': 0,
          'Total': 0
        };
      }
    });
    
    // Count patents for each employee by status
    patents.forEach(patent => {
      // Process PS Drafter tasks
      if (patent.ps_drafter_assgn) {
        // Review - when submitted for review
        if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) {
          stats[patent.ps_drafter_assgn]['Review']++;
          stats[patent.ps_drafter_assgn]['Total']++;
        } 
        // Completed - when approved
        else if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 1) {
          stats[patent.ps_drafter_assgn]['Completed']++;
          stats[patent.ps_drafter_assgn]['Total']++;
        }
        // Drafting - in progress
        else if (patent.ps_drafting_status === 0) {
          stats[patent.ps_drafter_assgn]['Drafting']++;
          stats[patent.ps_drafter_assgn]['Total']++;
        }
      }
      
      // Process PS Filer tasks (only if drafting is completed)
      if (patent.ps_filer_assgn && patent.ps_drafting_status === 1) {
        // Review - when submitted for review
        if (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) {
          stats[patent.ps_filer_assgn]['Review']++;
          stats[patent.ps_filer_assgn]['Total']++;
        } 
        // Completed - when approved
        else if (patent.ps_filing_status === 1 && patent.ps_review_file_status === 1) {
          stats[patent.ps_filer_assgn]['Completed']++;
          stats[patent.ps_filer_assgn]['Total']++;
        }
        // Drafting - in progress
        else if (patent.ps_filing_status === 0) {
          stats[patent.ps_filer_assgn]['Drafting']++;
          stats[patent.ps_filer_assgn]['Total']++;
        }
      }
      
      // Process CS Drafter tasks (only after PS is complete)
      if (patent.cs_drafter_assgn && patent.ps_filing_status === 1) {
        // Review - when submitted for review
        if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) {
          stats[patent.cs_drafter_assgn]['Review']++;
          stats[patent.cs_drafter_assgn]['Total']++;
        } 
        // Completed - when approved
        else if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 1) {
          stats[patent.cs_drafter_assgn]['Completed']++;
          stats[patent.cs_drafter_assgn]['Total']++;
        }
        // Drafting - in progress
        else if (patent.cs_drafting_status === 0) {
          stats[patent.cs_drafter_assgn]['Drafting']++;
          stats[patent.cs_drafter_assgn]['Total']++;
        }
      }
      
      // Process CS Filer tasks (only if CS drafting is completed)
      if (patent.cs_filer_assgn && patent.cs_drafting_status === 1) {
        // Review - when submitted for review
        if (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) {
          stats[patent.cs_filer_assgn]['Review']++;
          stats[patent.cs_filer_assgn]['Total']++;
        } 
        // Completed - when approved
        else if (patent.cs_filing_status === 1 && patent.cs_review_file_status === 1) {
          stats[patent.cs_filer_assgn]['Completed']++;
          stats[patent.cs_filer_assgn]['Total']++;
        }
        // Drafting - in progress
        else if (patent.cs_filing_status === 0) {
          stats[patent.cs_filer_assgn]['Drafting']++;
          stats[patent.cs_filer_assgn]['Total']++;
        }
      }
      
      // Process FER tasks
      if (patent.fer_status === 1) {
        // FER Drafter
        if (patent.fer_drafter_assgn) {
          // Review - when submitted for review
          if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) {
            stats[patent.fer_drafter_assgn]['Review']++;
            stats[patent.fer_drafter_assgn]['Total']++;
          } 
          // Completed - when approved
          else if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 1) {
            stats[patent.fer_drafter_assgn]['Completed']++;
            stats[patent.fer_drafter_assgn]['Total']++;
          }
          // Drafting - in progress
          else if (patent.fer_drafter_status === 0) {
            stats[patent.fer_drafter_assgn]['Drafting']++;
            stats[patent.fer_drafter_assgn]['Total']++;
          }
        }
        
        // FER Filer (only if FER drafting is completed)
        if (patent.fer_filer_assgn && patent.fer_drafter_status === 1) {
          // Review - when submitted for review
          if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0) {
            stats[patent.fer_filer_assgn]['Review']++;
            stats[patent.fer_filer_assgn]['Total']++;
          } 
          // Completed - when approved
          else if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 1) {
            stats[patent.fer_filer_assgn]['Completed']++;
            stats[patent.fer_filer_assgn]['Total']++;
          }
          // Drafting - in progress
          else if (patent.fer_filing_status === 0) {
            stats[patent.fer_filer_assgn]['Drafting']++;
            stats[patent.fer_filer_assgn]['Total']++;
          }
        }
      }
      
      // Pending for confirmation status (applicable for both PS and CS)
      if (patent.pending_ps_confirmation && patent.ps_drafter_assgn) {
        stats[patent.ps_drafter_assgn]['Pending']++;
        // Avoid double counting in the total
        if (stats[patent.ps_drafter_assgn]['Drafting'] > 0) {
          stats[patent.ps_drafter_assgn]['Drafting']--;
        }
      }
      
      if (patent.pending_cs_confirmation && patent.cs_drafter_assgn) {
        stats[patent.cs_drafter_assgn]['Pending']++;
        // Avoid double counting in the total
        if (stats[patent.cs_drafter_assgn]['Drafting'] > 0) {
          stats[patent.cs_drafter_assgn]['Drafting']--;
        }
      }
    });
    
    return stats;
  }, [patents]);
  
  // Function to get the appropriate background color based on status
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'Review': return 'bg-red-500 text-white';  // Red
      case 'Completed': return 'bg-purple-500 text-white';  // Purple
      case 'Drafting': return 'bg-yellow-400';  // Yellow
      case 'Pending': return 'bg-orange-300';  // Orange
      case 'Total': return 'bg-green-500 text-white';  // Green
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
                    <TableHead key={employee} className="text-center font-bold">{employee}</TableHead>
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
