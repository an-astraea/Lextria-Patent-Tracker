
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { Users } from 'lucide-react';

interface TopEmployeesProps {
  patents: Patent[];
}

const TopEmployees: React.FC<TopEmployeesProps> = ({ patents }) => {
  const getEmployeeStatistics = () => {
    if (!patents.length) return null;

    const employeeStats = new Map();
    
    patents.forEach(patent => {
      if (patent.ps_drafter_assgn) {
        const key = patent.ps_drafter_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).drafting += 1;
        
        if (patent.ps_drafting_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      if (patent.ps_filer_assgn) {
        const key = patent.ps_filer_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).filing += 1;
        
        if (patent.ps_filing_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      if (patent.cs_drafter_assgn) {
        const key = patent.cs_drafter_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).drafting += 1;
        
        if (patent.cs_drafting_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      if (patent.cs_filer_assgn) {
        const key = patent.cs_filer_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).filing += 1;
        
        if (patent.cs_filing_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      if (patent.fer_drafter_assgn) {
        const key = patent.fer_drafter_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).drafting += 1;
        
        if (patent.fer_drafter_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
      
      if (patent.fer_filer_assgn) {
        const key = patent.fer_filer_assgn;
        if (!employeeStats.has(key)) {
          employeeStats.set(key, { 
            drafting: 0, 
            filing: 0, 
            completed: 0,
            inProgress: 0 
          });
        }
        employeeStats.get(key).filing += 1;
        
        if (patent.fer_filing_status === 1) {
          employeeStats.get(key).completed += 1;
        } else {
          employeeStats.get(key).inProgress += 1;
        }
      }
    });
    
    return employeeStats;
  };
  
  const getTopEmployees = (employeeStats: Map<string, any>) => {
    if (!employeeStats) return [];
    
    return Array.from(employeeStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  };
  
  const employeeStats = getEmployeeStatistics();
  const topEmployees = employeeStats ? getTopEmployees(employeeStats) : [];
  
  if (topEmployees.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Employee Performance</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Top employees by completed tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topEmployees.map((employee, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {employee.drafting} drafting, {employee.filing} filing tasks
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{employee.completed} completed</p>
                <p className="text-xs text-muted-foreground">
                  {employee.inProgress} in progress
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopEmployees;
