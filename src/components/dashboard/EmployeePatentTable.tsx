
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmployeeStats {
  name: string;
  totalAssigned: number;
  psCompleted: number;
  csCompleted: number;
  ferCompleted: number;
  inProgress: number;
}

interface EmployeePatentTableProps {
  patents: Patent[];
}

const EmployeePatentTable: React.FC<EmployeePatentTableProps> = ({ patents }) => {
  // Generate employee stats from patent data
  const getEmployeeStats = (): EmployeeStats[] => {
    const employeeMap = new Map<string, EmployeeStats>();
    
    patents.forEach(patent => {
      // Process all employees assigned to any role in the patent
      [
        patent.ps_drafter_assgn,
        patent.ps_filer_assgn,
        patent.cs_drafter_assgn,
        patent.cs_filer_assgn,
        patent.fer_drafter_assgn,
        patent.fer_filer_assgn
      ].filter(Boolean).forEach(employeeName => {
        if (!employeeName) return;
        
        if (!employeeMap.has(employeeName)) {
          employeeMap.set(employeeName, {
            name: employeeName,
            totalAssigned: 0,
            psCompleted: 0,
            csCompleted: 0,
            ferCompleted: 0,
            inProgress: 0
          });
        }
        
        const stats = employeeMap.get(employeeName)!;
        stats.totalAssigned++;
        
        // Count completed PS drafting/filing tasks
        if (patent.ps_drafter_assgn === employeeName && patent.ps_drafting_status === 1) {
          stats.psCompleted++;
        } else if (patent.ps_filer_assgn === employeeName && patent.ps_filing_status === 1) {
          stats.psCompleted++;
        }
        // Count completed CS drafting/filing tasks
        else if (patent.cs_drafter_assgn === employeeName && patent.cs_drafting_status === 1) {
          stats.csCompleted++;
        } else if (patent.cs_filer_assgn === employeeName && patent.cs_filing_status === 1) {
          stats.csCompleted++;
        }
        // Count completed FER drafting/filing tasks
        else if (patent.fer_drafter_assgn === employeeName && patent.fer_drafter_status === 1) {
          stats.ferCompleted++;
        } else if (patent.fer_filer_assgn === employeeName && patent.fer_filing_status === 1) {
          stats.ferCompleted++;
        }
        // If none of the above, count as in progress
        else {
          stats.inProgress++;
        }
      });
    });
    
    // Convert map to array and sort by total assigned
    return Array.from(employeeMap.values())
      .sort((a, b) => b.totalAssigned - a.totalAssigned);
  };

  const employeeStats = getEmployeeStats();

  if (employeeStats.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No employee data available</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee Performance ({employeeStats.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="min-w-[150px]">Employee</TableHead>
                <TableHead className="text-right min-w-[120px]">Total Assigned</TableHead>
                <TableHead className="text-right min-w-[120px]">PS Completed</TableHead>
                <TableHead className="text-right min-w-[120px]">CS Completed</TableHead>
                <TableHead className="text-right min-w-[120px]">FER Completed</TableHead>
                <TableHead className="text-right min-w-[120px]">In Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeStats.map((employee) => (
                <TableRow key={employee.name}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-right">{employee.totalAssigned}</TableCell>
                  <TableCell className="text-right">{employee.psCompleted}</TableCell>
                  <TableCell className="text-right">{employee.csCompleted}</TableCell>
                  <TableCell className="text-right">{employee.ferCompleted}</TableCell>
                  <TableCell className="text-right">{employee.inProgress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeePatentTable;
