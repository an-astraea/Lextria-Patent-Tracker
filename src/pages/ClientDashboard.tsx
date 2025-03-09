
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPatents = async () => {
      try {
        setLoading(true);
        const patentData = await fetchPatents();
        
        if (Array.isArray(patentData)) {
          setPatents(patentData);
          
          // Extract unique client IDs
          const uniqueClients = Array.from(new Set(patentData.map(p => p.client_id)));
          setClients(uniqueClients as string[]);
        } else {
          console.error('Invalid patents data format:', patentData);
          toast.error('Failed to load patents data');
        }
      } catch (error) {
        console.error('Error loading patents:', error);
        toast.error('Failed to load patents');
      } finally {
        setLoading(false);
      }
    };
    
    loadPatents();
  }, []);
  
  // Group patents by client ID
  const patentsByClient = clients.map(clientId => {
    const clientPatents = patents.filter(p => p.client_id === clientId);
    return {
      clientId,
      patents: clientPatents,
      totalPatents: clientPatents.length,
      pendingPatents: clientPatents.filter(p => 
        p.ps_completion_status === 0 || 
        p.cs_completion_status === 0 || 
        (p.fer_status === 1 && p.fer_completion_status === 0)
      ).length
    };
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Client Dashboard</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active Clients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patentsByClient.map(client => (
              <Card key={client.clientId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Client: {client.clientId}</CardTitle>
                  <CardDescription>
                    Total Patents: {client.totalPatents}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Patents</p>
                        <p className="text-xl font-semibold">{client.pendingPatents}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed Patents</p>
                        <p className="text-xl font-semibold">{client.totalPatents - client.pendingPatents}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/patents?client=${client.clientId}`)}
                    >
                      View Patents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {patentsByClient.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No clients found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patentsByClient
              .filter(client => client.pendingPatents > 0)
              .map(client => (
                <Card key={client.clientId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Client: {client.clientId}</span>
                      <StatusBadge status="active" />
                    </CardTitle>
                    <CardDescription>
                      Active Patents: {client.pendingPatents} of {client.totalPatents}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round((client.totalPatents - client.pendingPatents) / client.totalPatents * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${Math.round((client.totalPatents - client.pendingPatents) / client.totalPatents * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="default"
                        className="w-full"
                        onClick={() => navigate(`/patents?client=${client.clientId}&status=pending`)}
                      >
                        View Active Patents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          
          {patentsByClient.filter(client => client.pendingPatents > 0).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active clients found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
