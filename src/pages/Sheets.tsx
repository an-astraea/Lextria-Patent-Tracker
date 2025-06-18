
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Download, Filter, Search } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';

const Sheets = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  useEffect(() => {
    const loadPatents = async () => {
      try {
        setLoading(true);
        const patentsData = await fetchPatents();
        setPatents(patentsData);
        setFilteredPatents(patentsData);
      } catch (error) {
        console.error('Error loading patents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatents();
  }, []);

  useEffect(() => {
    let filtered = patents;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patent =>
        patent.tracking_id.toLowerCase().includes(query) ||
        patent.patent_title.toLowerCase().includes(query) ||
        patent.patent_applicant.toLowerCase().includes(query) ||
        patent.client_id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'completed':
          filtered = filtered.filter(patent => patent.completed === true);
          break;
        case 'in_progress':
          filtered = filtered.filter(patent => !patent.completed && !patent.withdrawn);
          break;
        case 'withdrawn':
          filtered = filtered.filter(patent => patent.withdrawn === true);
          break;
      }
    }

    // Apply client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(patent => patent.client_id === clientFilter);
    }

    setFilteredPatents(filtered);
  }, [patents, searchQuery, statusFilter, clientFilter]);

  const getUniqueClients = () => {
    return Array.from(new Set(patents.map(patent => patent.client_id))).sort();
  };

  const getStatus = (patent: Patent) => {
    if (patent.completed) return { label: 'Completed', color: 'bg-green-100 text-green-800' };
    if (patent.withdrawn) return { label: 'Withdrawn', color: 'bg-red-100 text-red-800' };
    return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
  };

  const exportToExcel = () => {
    const exportData = filteredPatents.map(patent => ({
      'Tracking ID': patent.tracking_id,
      'Patent Title': patent.patent_title,
      'Applicant': patent.patent_applicant,
      'Client': patent.client_id,
      'Application No': patent.application_no || 'N/A',
      'Filing Date': format(new Date(patent.date_of_filing), 'dd/MM/yyyy'),
      'PS Drafting': patent.ps_drafting_status ? 'Complete' : 'Pending',
      'PS Filing': patent.ps_filing_status ? 'Complete' : 'Pending',
      'CS Drafting': patent.cs_drafting_status ? 'Complete' : 'Pending',
      'CS Filing': patent.cs_filing_status ? 'Complete' : 'Pending',
      'FER Status': patent.fer_status ? 'Active' : 'Inactive',
      'Status': getStatus(patent).label,
      'PS Drafter': patent.ps_drafter_assgn || 'N/A',
      'PS Filer': patent.ps_filer_assgn || 'N/A',
      'CS Drafter': patent.cs_drafter_assgn || 'N/A',
      'CS Filer': patent.cs_filer_assgn || 'N/A',
      'FER Drafter': patent.fer_drafter_assgn || 'N/A',
      'FER Filer': patent.fer_filer_assgn || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patents');
    
    const fileName = `Patents_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full max-w-none">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <PageHeader
          title="Patent Sheets"
          subtitle="Export and analyze patent data in spreadsheet format"
        />

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search">Search Patents</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by ID, title, applicant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client">Client Filter</Label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {getUniqueClients().map(client => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={exportToExcel} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredPatents.length} of {patents.length} patents
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patent Data</CardTitle>
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
                    <TableHead className="min-w-[120px]">Filing Date</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">PS Progress</TableHead>
                    <TableHead className="min-w-[120px]">CS Progress</TableHead>
                    <TableHead className="min-w-[100px]">FER Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatents.map((patent) => {
                    const status = getStatus(patent);
                    return (
                      <TableRow key={patent.id}>
                        <TableCell className="font-medium">{patent.tracking_id}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={patent.patent_title}>
                            {patent.patent_title}
                          </div>
                        </TableCell>
                        <TableCell>{patent.patent_applicant}</TableCell>
                        <TableCell>{patent.client_id}</TableCell>
                        <TableCell>
                          {format(new Date(patent.date_of_filing), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={patent.ps_drafting_status ? 'default' : 'secondary'} className="text-xs">
                              Draft: {patent.ps_drafting_status ? '✓' : '✗'}
                            </Badge>
                            <Badge variant={patent.ps_filing_status ? 'default' : 'secondary'} className="text-xs">
                              File: {patent.ps_filing_status ? '✓' : '✗'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={patent.cs_drafting_status ? 'default' : 'secondary'} className="text-xs">
                              Draft: {patent.cs_drafting_status ? '✓' : '✗'}
                            </Badge>
                            <Badge variant={patent.cs_filing_status ? 'default' : 'secondary'} className="text-xs">
                              File: {patent.cs_filing_status ? '✓' : '✗'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={patent.fer_status ? 'default' : 'secondary'}>
                            {patent.fer_status ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
