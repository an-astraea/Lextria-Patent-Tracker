
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { Building, Briefcase } from 'lucide-react';

interface TopClientsProps {
  patents: Patent[];
}

const TopClients: React.FC<TopClientsProps> = ({ patents }) => {
  const getClientStatistics = () => {
    if (!patents.length) return null;

    const clientStats = new Map();
    
    patents.forEach(patent => {
      const clientId = patent.client_id;
      if (!clientStats.has(clientId)) {
        clientStats.set(clientId, {
          total: 0,
          completed: 0,
          inProgress: 0,
          employees: new Set()
        });
      }
      
      clientStats.get(clientId).total += 1;
      
      if (patent.ps_completion_status === 1 && 
          patent.cs_completion_status === 1 && 
          (patent.fer_status === 0 || patent.fer_completion_status === 1)) {
        clientStats.get(clientId).completed += 1;
      } else {
        clientStats.get(clientId).inProgress += 1;
      }
      
      [
        patent.ps_drafter_assgn, 
        patent.ps_filer_assgn,
        patent.cs_drafter_assgn,
        patent.cs_filer_assgn,
        patent.fer_drafter_assgn,
        patent.fer_filer_assgn
      ].filter(Boolean).forEach(emp => {
        if (emp) clientStats.get(clientId).employees.add(emp);
      });
    });
    
    for (const [clientId, stats] of clientStats.entries()) {
      clientStats.set(clientId, {
        ...stats,
        employeeCount: stats.employees.size,
        employees: Array.from(stats.employees)
      });
    }
    
    return clientStats;
  };
  
  const getTopClients = (clientStats: Map<string, any>) => {
    if (!clientStats) return [];
    
    return Array.from(clientStats.entries())
      .map(([clientId, stats]) => ({ clientId, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };
  
  const clientStats = getClientStatistics();
  const topClients = clientStats ? getTopClients(clientStats) : [];
  
  if (topClients.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Client Overview</CardTitle>
          <Building className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Patents by client</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topClients.map((client, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Client {client.clientId}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.employeeCount} employees assigned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{client.total} patents</p>
                <p className="text-xs text-muted-foreground">
                  {client.completed} completed, {client.inProgress} in progress
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopClients;
