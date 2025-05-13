
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ patents }) => {
  // Define the status types we want to track
  const statusTypes = ['PS Drafting', 'PS Filing', 'CS Drafting', 'CS Filing', 'FER Drafting', 'FER Filing'];
  
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
          'PS Drafting': 0,
          'PS Filing': 0,
          'CS Drafting': 0,
          'CS Filing': 0,
          'FER Drafting': 0,
          'FER Filing': 0,
          'Total': 0
        };
      }
    });
    
    // Count patents for each employee by status
    patents.forEach(patent => {
      // PS Drafting
      if (patent.ps_drafter_assgn && patent.ps_drafting_status === 0) {
        stats[patent.ps_drafter_assgn]['PS Drafting']++;
        stats[patent.ps_drafter_assgn]['Total']++;
      }
      
      // PS Filing
      if (patent.ps_filer_assgn && patent.ps_drafting_status === 1 && patent.ps_filing_status === 0) {
        stats[patent.ps_filer_assgn]['PS Filing']++;
        stats[patent.ps_filer_assgn]['Total']++;
      }
      
      // CS Drafting
      if (patent.cs_drafter_assgn && patent.cs_drafting_status === 0 && patent.ps_filing_status === 1) {
        stats[patent.cs_drafter_assgn]['CS Drafting']++;
        stats[patent.cs_drafter_assgn]['Total']++;
      }
      
      // CS Filing
      if (patent.cs_filer_assgn && patent.cs_drafting_status === 1 && patent.cs_filing_status === 0) {
        stats[patent.cs_filer_assgn]['CS Filing']++;
        stats[patent.cs_filer_assgn]['Total']++;
      }
      
      // FER Drafting
      if (patent.fer_drafter_assgn && patent.fer_status === 1 && patent.fer_drafter_status === 0) {
        stats[patent.fer_drafter_assgn]['FER Drafting']++;
        stats[patent.fer_drafter_assgn]['Total']++;
      }
      
      // FER Filing
      if (patent.fer_filer_assgn && patent.fer_drafter_status === 1 && patent.fer_filing_status === 0) {
        stats[patent.fer_filer_assgn]['FER Filing']++;
        stats[patent.fer_filer_assgn]['Total']++;
      }
    });
    
    return stats;
  }, [patents]);
  
  // Function to get the appropriate background color based on count
  const getBackgroundColor = (count: number) => {
    if (count === 0) return '';
    if (count <= 3) return 'bg-green-100';
    if (count <= 6) return 'bg-yellow-100';
    return 'bg-red-100';
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
      <CardHeader className="pb-3">
        <CardTitle>Patent Count by Employee & Status</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Employee</TableHead>
                  {statusTypes.map(status => (
                    <TableHead key={status} className="text-center">{status}</TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.map(employee => (
                  <TableRow key={employee}>
                    <TableCell className="font-medium">{employee}</TableCell>
                    {statusTypes.map(status => (
                      <TableCell 
                        key={`${employee}-${status}`} 
                        className={`text-center ${getBackgroundColor(employeeStats[employee][status])}`}
                      >
                        {employeeStats[employee][status]}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {employeeStats[employee]['Total']}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  {statusTypes.map(status => {
                    const total = sortedEmployees.reduce(
                      (sum, employee) => sum + employeeStats[employee][status], 
                      0
                    );
                    return (
                      <TableCell 
                        key={`total-${status}`} 
                        className={`text-center font-bold ${getBackgroundColor(total)}`}
                      >
                        {total}
                      </TableCell>
                    );
                  })}
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
