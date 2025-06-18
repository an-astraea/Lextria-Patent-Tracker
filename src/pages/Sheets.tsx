
import React, { useState, useEffect } from 'react';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const Sheets = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  useEffect(() => {
    loadPatents();
  }, []);

  useEffect(() => {
    filterPatents();
  }, [patents, searchQuery, statusFilter, clientFilter]);

  const loadPatents = async () => {
    setIsLoading(true);
    try {
      const patentsData = await fetchPatents();
      setPatents(patentsData);
    } catch (error) {
      console.error('Error loading patents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatents = () => {
    let filtered = [...patents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(patent => 
        patent.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patent.patent_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patent.patent_applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patent.client_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patent => {
        const isCompleted = patent.ps_completion_status === 1 && 
                           patent.cs_completion_status === 1 && 
                           (patent.fer_status === 0 || patent.fer_completion_status === 1);
        
        switch (statusFilter) {
          case 'completed':
            return isCompleted;
          case 'in_progress':
            return !isCompleted && (patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1);
          case 'not_started':
            return patent.ps_drafting_status === 0 && patent.cs_drafting_status === 0 && patent.fer_drafter_status === 0;
          default:
            return true;
        }
      });
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(patent => patent.client_id === clientFilter);
    }

    setFilteredPatents(filtered);
  };

  const getUniqueClients = () => {
    return Array.from(new Set(patents.map(patent => patent.client_id)));
  };

  const getStatusColor = (status: number) => {
    return status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStage = (patent: Patent) => {
    if (patent.ps_completion_status === 1 && patent.cs_completion_status === 1 && 
        (patent.fer_status === 0 || patent.fer_completion_status === 1)) {
      return 'Completed';
    }
    if (patent.fer_status === 1) return 'FER';
    if (patent.cs_filing_status === 1) return 'CS Filing';
    if (patent.cs_drafting_status === 1) return 'CS Drafting';
    if (patent.ps_filing_status === 1) return 'PS Filing';
    if (patent.ps_drafting_status === 1) return 'PS Drafting';
    return 'Initial';
  };

  const exportToExcel = () => {
    if (filteredPatents.length === 0) return;

    const exportData = filteredPatents.map(patent => ({
      'Tracking ID': patent.tracking_id,
      'Title': patent.patent_title,
      'Applicant': patent.patent_applicant,
      'Client ID': patent.client_id,
      'Filing Date': format(new Date(patent.date_of_filing), 'yyyy-MM-dd'),
      'Stage': getStage(patent),
      'PS Drafting': patent.ps_drafting_status ? 'Completed' : 'Pending',
      'PS Filing': patent.ps_filing_status ? 'Completed' : 'Pending',
      'CS Drafting': patent.cs_drafting_status ? 'Completed' : 'Pending',
      'CS Filing': patent.cs_filing_status ? 'Completed' : 'Pending',
      'FER Status': patent.fer_status ? 'Active' : 'Inactive',
      'PS Drafter': patent.ps_drafter_assgn || '',
      'PS Filer': patent.ps_filer_assgn || '',
      'CS Drafter': patent.cs_drafter_assgn || '',
      'CS Filer': patent.cs_filer_assgn || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patents_Data');
    
    XLSX.writeFile(workbook, `Patents_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full h-full">
      <div className="p-4 md:p-6 w-full">
        <PageHeader
          title="Patents Data Sheets"
          subtitle="View and export patent data in spreadsheet format"
        />

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {getUniqueClients().map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPatents}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToExcel} disabled={filteredPatents.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              Patent Data ({filteredPatents.length} of {patents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-auto max-h-[70vh]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="min-w-[120px]">Tracking ID</TableHead>
                    <TableHead className="min-w-[200px]">Title</TableHead>
                    <TableHead className="min-w-[150px]">Applicant</TableHead>
                    <TableHead className="min-w-[100px]">Client</TableHead>
                    <TableHead className="min-w-[100px]">Stage</TableHead>
                    <TableHead className="min-w-[120px]">Filing Date</TableHead>
                    <TableHead className="min-w-[120px]">PS Status</TableHead>
                    <TableHead className="min-w-[120px]">CS Status</TableHead>
                    <TableHead className="min-w-[100px]">FER Status</TableHead>
                    <TableHead className="min-w-[150px]">PS Drafter</TableHead>
                    <TableHead className="min-w-[150px]">CS Drafter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatents.map((patent) => (
                    <TableRow key={patent.id}>
                      <TableCell className="font-medium">{patent.tracking_id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={patent.patent_title}>
                          {patent.patent_title}
                        </div>
                      </TableCell>
                      <TableCell>{patent.patent_applicant}</TableCell>
                      <TableCell>{patent.client_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getStage(patent)}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(patent.date_of_filing), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Badge className={getStatusColor(patent.ps_drafting_status)}>
                            D: {patent.ps_drafting_status ? '✓' : '✗'}
                          </Badge>
                          <Badge className={getStatusColor(patent.ps_filing_status)}>
                            F: {patent.ps_filing_status ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Badge className={getStatusColor(patent.cs_drafting_status)}>
                            D: {patent.cs_drafting_status ? '✓' : '✗'}
                          </Badge>
                          <Badge className={getStatusColor(patent.cs_filing_status)}>
                            F: {patent.cs_filing_status ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(patent.fer_status)}>
                          {patent.fer_status ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{patent.ps_drafter_assgn || '-'}</TableCell>
                      <TableCell>{patent.cs_drafter_assgn || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sheets;
