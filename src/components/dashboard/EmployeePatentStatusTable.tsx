
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Patent, Employee } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
  employees?: Employee[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ 
  patents, 
  employees = [] 
}) => {
  // Create a set of filer names to exclude them
  const filerNames = new Set(
    employees.filter(emp => emp.role === 'filer').map(emp => emp.full_name)
  );

  // Get unique employee names from drafter assignments only (exclude filers)
  const employeeNames = new Set<string>();
  
  patents.forEach(patent => {
    // Only process drafter assignment fields
    [patent.ps_drafter_assgn, patent.cs_drafter_assgn, patent.fer_drafter_assgn]
      .filter(Boolean)
      .forEach(name => {
        if (name && !filerNames.has(name)) {
          employeeNames.add(name);
        }
      });
  });

  const employeeArray = Array.from(employeeNames).sort();

  if (employeeArray.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Employee Patent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No drafter assignments found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate status counts for each employee (only drafter work)
  const getEmployeeStatusCounts = (employeeName: string) => {
    let review = 0;
    let completed = 0;
    let drafting = 0;
    let pendingConfirmation = 0;
    let pendingInformation = 0;

    patents.forEach(patent => {
      // Only count work where this employee is assigned as a drafter
      let isAssignedAsDrafter = false;
      
      // Check PS drafter assignment
      if (patent.ps_drafter_assgn === employeeName) {
        isAssignedAsDrafter = true;
        if (patent.ps_drafting_status === 1) {
          completed++;
        } else if (patent.ps_drafting_status === 0) {
          drafting++;
        }
      }
      
      // Check CS drafter assignment
      if (patent.cs_drafter_assgn === employeeName) {
        isAssignedAsDrafter = true;
        if (patent.cs_drafting_status === 1) {
          completed++;
        } else if (patent.cs_drafting_status === 0) {
          drafting++;
        }
      }
      
      // Check FER drafter assignment
      if (patent.fer_drafter_assgn === employeeName) {
        isAssignedAsDrafter = true;
        if (patent.fer_drafter_status === 1) {
          completed++;
        } else if (patent.fer_drafter_status === 0) {
          drafting++;
        }
      }

      // Count other statuses only if assigned as drafter
      if (isAssignedAsDrafter) {
        if (patent.pending_ps_confirmation || patent.pending_cs_confirmation) {
          pendingConfirmation++;
        }
        
        // Add other status logic as needed
        review++; // This might need more specific logic based on your requirements
      }
    });

    return {
      review,
      completed,
      drafting,
      pendingConfirmation,
      pendingInformation,
      total: review + completed + drafting + pendingConfirmation + pendingInformation
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee Patent Status (Drafters Only)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="min-w-[120px]">Status</TableHead>
                {employeeArray.map(name => (
                  <TableHead key={name} className="text-center min-w-[100px]">
                    {name}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[80px] font-bold">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Review</TableCell>
                {employeeArray.map(name => {
                  const counts = getEmployeeStatusCounts(name);
                  return (
                    <TableCell key={name} className="text-center">
                      {counts.review}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {employeeArray.reduce((sum, name) => sum + getEmployeeStatusCounts(name).review, 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Completed</TableCell>
                {employeeArray.map(name => {
                  const counts = getEmployeeStatusCounts(name);
                  return (
                    <TableCell key={name} className="text-center">
                      {counts.completed}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {employeeArray.reduce((sum, name) => sum + getEmployeeStatusCounts(name).completed, 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="bg-yellow-50">
                <TableCell className="font-medium">Drafting</TableCell>
                {employeeArray.map(name => {
                  const counts = getEmployeeStatusCounts(name);
                  return (
                    <TableCell key={name} className="text-center">
                      {counts.drafting}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {employeeArray.reduce((sum, name) => sum + getEmployeeStatusCounts(name).drafting, 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="bg-orange-50">
                <TableCell className="font-medium">Pending Confirmation</TableCell>
                {employeeArray.map(name => {
                  const counts = getEmployeeStatusCounts(name);
                  return (
                    <TableCell key={name} className="text-center">
                      {counts.pendingConfirmation}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {employeeArray.reduce((sum, name) => sum + getEmployeeStatusCounts(name).pendingConfirmation, 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="bg-purple-50">
                <TableCell className="font-medium">Pending Information</TableCell>
                {employeeArray.map(name => {
                  const counts = getEmployeeStatusCounts(name);
                  return (
                    <TableCell key={name} className="text-center">
                      {counts.pendingInformation}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {employeeArray.reduce((sum, name) => sum + getEmployeeStatusCounts(name).pendingInformation, 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="bg-gray-100 font-bold">
                <TableCell className="font-bold">TOTAL</TableCell>
                {employeeArray.map(name => {
                  const counts = getEmployeeStatusCounts(name);
                  return (
                    <TableCell key={name} className="text-center font-bold">
                      {counts.total}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {employeeArray.reduce((sum, name) => sum + getEmployeeStatusCounts(name).total, 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeePatentStatusTable;
