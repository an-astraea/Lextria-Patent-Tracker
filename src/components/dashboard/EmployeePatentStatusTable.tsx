import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '@/lib/api/employee-api';

interface EmployeePatentStatusTableProps {
  patents: Patent[];
}

const EmployeePatentStatusTable: React.FC<EmployeePatentStatusTableProps> = ({ patents }) => {
  const navigate = useNavigate();
  
  // Fetch employees to filter out filers
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
  
  // Create a set of filer names for quick lookup
  const filerNames = useMemo(() => {
    return new Set(
      employees.filter(emp => emp.role === 'filer').map(emp => emp.full_name)
    );
  }, [employees]);
  
  // Define the status types we want to track
  const statusTypes = ['Review', 'Completed', 'Drafting', 'Pending Confirmation', 'Pending Information'];
  
  // Calculate employee stats based on patents
  const employeeStats = useMemo(() => {
    const stats: Record<string, { [key: string]: number }> = {};
    
    // Initialize with all employees who are assigned to any patents (excluding filers)
    const allEmployees = new Set<string>();
    
    patents.forEach(patent => {
      // Add all assigned employees to the set, but exclude filers
      if (patent.ps_drafter_assgn && !filerNames.has(patent.ps_drafter_assgn)) allEmployees.add(patent.ps_drafter_assgn);
      if (patent.ps_filer_assgn && !filerNames.has(patent.ps_filer_assgn)) allEmployees.add(patent.ps_filer_assgn);
      if (patent.cs_drafter_assgn && !filerNames.has(patent.cs_drafter_assgn)) allEmployees.add(patent.cs_drafter_assgn);
      if (patent.cs_filer_assgn && !filerNames.has(patent.cs_filer_assgn)) allEmployees.add(patent.cs_filer_assgn);
      if (patent.fer_drafter_assgn && !filerNames.has(patent.fer_drafter_assgn)) allEmployees.add(patent.fer_drafter_assgn);
      if (patent.fer_filer_assgn && !filerNames.has(patent.fer_filer_assgn)) allEmployees.add(patent.fer_filer_assgn);
    });
    
    // Initialize stats object with all employees (excluding filers)
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
    
    // Count patents for each employee by status (excluding filers)
    patents.forEach(patent => {
      // Process PS Drafter tasks
      if (patent.ps_drafter_assgn && !filerNames.has(patent.ps_drafter_assgn)) {
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
        
        // Pending for IDF state
        if (!patent.idf_received && patent.idf_sent) {
          stats[patent.ps_drafter_assgn]['Pending Information']++;
          // Avoid double counting in the total
          if (stats[patent.ps_drafter_assgn]['Drafting'] > 0) {
            stats[patent.ps_drafter_assgn]['Drafting']--;
          }
        }
        
        // Pending Confirmation (new category for PS confirmation)
        if (patent.pending_ps_confirmation) {
          stats[patent.ps_drafter_assgn]['Pending Confirmation']++;
          // Avoid double counting in the total
          if (stats[patent.ps_drafter_assgn]['Pending Information'] > 0) {
            stats[patent.ps_drafter_assgn]['Pending Information']--;
          } else if (stats[patent.ps_drafter_assgn]['Drafting'] > 0) {
            stats[patent.ps_drafter_assgn]['Drafting']--;
          }
        }
      }
      
      // Process PS Filer tasks (only if drafting is completed and not a filer)
      if (patent.ps_filer_assgn && !filerNames.has(patent.ps_filer_assgn) && patent.ps_drafting_status === 1) {
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
        
        // Pending for IDF state
        if (!patent.idf_received && patent.idf_sent) {
          stats[patent.ps_filer_assgn]['Pending Information']++;
          // Avoid double counting in the total
          if (stats[patent.ps_filer_assgn]['Drafting'] > 0) {
            stats[patent.ps_filer_assgn]['Drafting']--;
          }
        }
        
        // Pending Confirmation for PS filer
        if (patent.pending_ps_confirmation) {
          stats[patent.ps_filer_assgn]['Pending Confirmation']++;
          // Avoid double counting in the total
          if (stats[patent.ps_filer_assgn]['Pending Information'] > 0) {
            stats[patent.ps_filer_assgn]['Pending Information']--;
          } else if (stats[patent.ps_filer_assgn]['Drafting'] > 0) {
            stats[patent.ps_filer_assgn]['Drafting']--;
          }
        }
      }
      
      // Process CS Drafter tasks (only after PS is complete and not a filer)
      if (patent.cs_drafter_assgn && !filerNames.has(patent.cs_drafter_assgn) && patent.ps_filing_status === 1) {
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
        
        // Pending for IDF state
        if (!patent.idf_received && patent.idf_sent) {
          stats[patent.cs_drafter_assgn]['Pending Information']++;
          // Avoid double counting in the total
          if (stats[patent.cs_drafter_assgn]['Drafting'] > 0) {
            stats[patent.cs_drafter_assgn]['Drafting']--;
          }
        }
        
        // Pending Confirmation for CS drafter
        if (patent.pending_cs_confirmation) {
          stats[patent.cs_drafter_assgn]['Pending Confirmation']++;
          // Avoid double counting in the total
          if (stats[patent.cs_drafter_assgn]['Pending Information'] > 0) {
            stats[patent.cs_drafter_assgn]['Pending Information']--;
          } else if (stats[patent.cs_drafter_assgn]['Drafting'] > 0) {
            stats[patent.cs_drafter_assgn]['Drafting']--;
          }
        }
      }
      
      // Process CS Filer tasks (only if CS drafting is completed and not a filer)
      if (patent.cs_filer_assgn && !filerNames.has(patent.cs_filer_assgn) && patent.cs_drafting_status === 1) {
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
        
        // Pending for IDF state
        if (!patent.idf_received && patent.idf_sent) {
          stats[patent.cs_filer_assgn]['Pending Information']++;
          // Avoid double counting in the total
          if (stats[patent.cs_filer_assgn]['Drafting'] > 0) {
            stats[patent.cs_filer_assgn]['Drafting']--;
          }
        }
        
        // Pending Confirmation for CS filer
        if (patent.pending_cs_confirmation) {
          stats[patent.cs_filer_assgn]['Pending Confirmation']++;
          // Avoid double counting in the total
          if (stats[patent.cs_filer_assgn]['Pending Information'] > 0) {
            stats[patent.cs_filer_assgn]['Pending Information']--;
          } else if (stats[patent.cs_filer_assgn]['Drafting'] > 0) {
            stats[patent.cs_filer_assgn]['Drafting']--;
          }
        }
      }
      
      // Process FER tasks (excluding filers)
      if (patent.fer_status === 1) {
        // FER Drafter
        if (patent.fer_drafter_assgn && !filerNames.has(patent.fer_drafter_assgn)) {
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
        
        // FER Filer (only if FER drafting is completed and not a filer)
        if (patent.fer_filer_assgn && !filerNames.has(patent.fer_filer_assgn) && patent.fer_drafter_status === 1) {
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
    });
    
    return stats;
  }, [patents, filerNames]);
  
  // Function to get the appropriate background color based on status
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'Review': return 'bg-gray-300 text-black';  // Grey
      case 'Completed': return 'bg-green-500 text-white';  // Green
      case 'Drafting': return 'bg-yellow-400 text-black';  // Yellow
      case 'Pending Confirmation': return 'bg-orange-300 text-black';  // Orange for pending confirmation
      case 'Pending Information': return 'bg-purple-300 text-black';  // Purple for pending info
      case 'Total': return 'bg-white text-black';  // White with black text for Total
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
