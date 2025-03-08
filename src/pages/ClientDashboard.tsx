
import React, { useState, useEffect } from 'react';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, PieChart, FileText, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatentCard from '@/components/PatentCard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import * as XLSX from 'xlsx';

const ClientDashboard = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatents = async () => {
      setIsLoading(true);
      try {
        const allPatents = await fetchPatents();
        setPatents(allPatents);
        
        // Extract unique client IDs
        const uniqueClients = Array.from(new Set(allPatents.map(patent => patent.client_id)));
        setClients(uniqueClients);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading patents:', error);
        setIsLoading(false);
      }
    };
    
    loadPatents();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const clientPatents = patents.filter(patent => patent.client_id === selectedClient);
      setFilteredPatents(clientPatents);
    } else {
      setFilteredPatents([]);
    }
  }, [selectedClient, patents]);

  const handleExportToExcel = () => {
    if (filteredPatents.length === 0) return;

    // Prepare data for export
    const exportData = filteredPatents.map(patent => ({
      'Tracking ID': patent.tracking_id,
      'Patent Applicant': patent.patent_applicant,
      'Client ID': patent.client_id,
      'Application No': patent.application_no || 'N/A',
      'Date of Filing': patent.date_of_filing || 'Not Filed Yet',
      'Patent Title': patent.patent_title,
      'Applicant Address': patent.applicant_addr,
      'Inventor Phone': patent.inventor_ph_no,
      'Inventor Email': patent.inventor_email,
      'PS Drafting Status': patent.ps_drafting_status === 1 ? 'Completed' : 'Pending',
      'PS Drafter': patent.ps_drafter_assgn || 'N/A',
      'PS Drafter Deadline': patent.ps_drafter_deadline || 'N/A',
      'PS Filing Status': patent.ps_filing_status === 1 ? 'Completed' : 'Pending',
      'PS Filer': patent.ps_filer_assgn || 'N/A',
      'PS Filer Deadline': patent.ps_filer_deadline || 'N/A',
      'CS Drafting Status': patent.cs_drafting_status === 1 ? 'Completed' : 'Pending',
      'CS Drafter': patent.cs_drafter_assgn || 'N/A',
      'CS Drafter Deadline': patent.cs_drafter_deadline || 'N/A',
      'CS Filing Status': patent.cs_filing_status === 1 ? 'Completed' : 'Pending',
      'CS Filer': patent.cs_filer_assgn || 'N/A',
      'CS Filer Deadline': patent.cs_filer_deadline || 'N/A',
      'FER Status': patent.fer_status === 1 ? 'Active' : 'Inactive',
      'FER Drafting Status': patent.fer_drafter_status === 1 ? 'Completed' : 'Pending',
      'FER Drafter': patent.fer_drafter_assgn || 'N/A',
      'FER Drafter Deadline': patent.fer_drafter_deadline || 'N/A',
      'FER Filing Status': patent.fer_filing_status === 1 ? 'Completed' : 'Pending',
      'FER Filer': patent.fer_filer_assgn || 'N/A',
      'FER Filer Deadline': patent.fer_filer_deadline || 'N/A',
      'Created At': new Date(patent.created_at).toLocaleDateString(),
      'Updated At': new Date(patent.updated_at).toLocaleDateString(),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedClient}_Patents`);
    
    // Generate Excel file and download
    XLSX.writeFile(workbook, `${selectedClient}_Patents_Report.xlsx`);
  };

  const getCompletionStats = () => {
    if (filteredPatents.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    const completedPatents = filteredPatents.filter(patent => {
      const psDone = patent.ps_completion_status === 1;
      const csDone = patent.cs_completion_status === 1;
      const ferDone = patent.fer_status === 0 || patent.fer_completion_status === 1;
      
      return psDone && csDone && ferDone;
    });
    
    const percentage = Math.round((completedPatents.length / filteredPatents.length) * 100);
    
    return {
      total: filteredPatents.length,
      completed: completedPatents.length,
      percentage
    };
  };

  const getStageStats = () => {
    if (filteredPatents.length === 0) {
      return {
        psOnly: 0,
        psAndCs: 0,
        all: 0,
        fer: 0
      };
    }
    
    const psOnly = filteredPatents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 0
    ).length;
    
    const psAndCs = filteredPatents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 1 && 
      (p.fer_status === 0 || p.fer_completion_status === 0)
    ).length;
    
    const all = filteredPatents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 1 && 
      (p.fer_status === 0 || p.fer_completion_status === 1)
    ).length;
    
    const fer = filteredPatents.filter(p => p.fer_status === 1).length;
    
    return { psOnly, psAndCs, all, fer };
  };

  const stats = getCompletionStats();
  const stageStats = getStageStats();

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <PageHeader
        title="Client Dashboard"
        subtitle="View patent statistics and details for specific clients"
      />

      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedClient && (
          <Button 
            onClick={handleExportToExcel} 
            variant="outline" 
            className="w-full md:w-auto"
            disabled={filteredPatents.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState 
          size="lg" 
          text="Loading client data..."
          className="py-12" 
        />
      ) : selectedClient ? (
        <>
          {filteredPatents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Patents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-500 mr-2" />
                      <div className="text-2xl font-bold">{filteredPatents.length}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <PieChart className="h-6 w-6 text-green-500 mr-2" />
                      <div className="text-2xl font-bold">{stats.percentage}%</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.completed} of {stats.total} patents completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">FER Patents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-6 w-6 text-yellow-500 mr-2" />
                      <div className="text-2xl font-bold">{stageStats.fer}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Patents requiring further examination
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">PS Only Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-purple-500 mr-2" />
                      <div className="text-2xl font-bold">{stageStats.psOnly}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Patents with only PS stage completed
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="all" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Patents</TabsTrigger>
                  <TabsTrigger value="ps">PS Stage</TabsTrigger>
                  <TabsTrigger value="cs">CS Stage</TabsTrigger>
                  <TabsTrigger value="fer">FER Stage</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatents.map(patent => (
                      <PatentCard key={patent.id} patent={patent} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="ps">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatents
                      .filter(p => p.ps_drafter_assgn)
                      .map(patent => (
                        <PatentCard key={patent.id} patent={patent} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="cs">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatents
                      .filter(p => p.cs_drafter_assgn)
                      .map(patent => (
                        <PatentCard key={patent.id} patent={patent} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="fer">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatents
                      .filter(p => p.fer_status === 1)
                      .map(patent => (
                        <PatentCard key={patent.id} patent={patent} />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <EmptyState
              title="No patents found"
              message={`There are no patents assigned to client ${selectedClient}`}
              icon={<FileText />}
            />
          )}
        </>
      ) : (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Select a Client</CardTitle>
            <CardDescription>Choose a client from the dropdown to view their patent dashboard</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboard;
