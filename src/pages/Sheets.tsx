
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/common/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { fetchPatents } from '@/lib/api/patent-api';
import { downloadPatentsDatabase, downloadBulkUploadTemplate } from '@/utils/excel-utils';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import SearchFilters from '@/components/common/SearchFilters';

const Sheets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<string | undefined>(undefined);
  
  // Fetch all patents
  const { data: patents, isLoading, error } = useQuery({
    queryKey: ['patents'],
    queryFn: fetchPatents,
  });

  const handleSearch = (query: string, field?: string) => {
    setSearchQuery(query);
    setSearchField(field);
  };

  const searchFields = [
    { value: 'tracking_id', label: 'Tracking ID' },
    { value: 'patent_applicant', label: 'Applicant' },
    { value: 'patent_title', label: 'Title' },
    { value: 'client_id', label: 'Client ID' },
    { value: 'application_no', label: 'Application #' },
  ];

  // Filter patents based on search
  const filteredPatents = patents ? patents.filter(patent => {
    if (!searchQuery) return true;
    
    if (searchField) {
      const value = patent[searchField as keyof typeof patent];
      return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // Search across multiple fields if no specific field is selected
    return (
      patent.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patent.patent_applicant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patent.patent_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patent.client_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patent.application_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) : [];

  const handleDownloadDatabase = () => {
    if (patents && patents.length > 0) {
      downloadPatentsDatabase(patents);
    }
  };

  const handleDownloadTemplate = () => {
    downloadBulkUploadTemplate();
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <PageHeader title="Patent Database Sheets" />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleDownloadDatabase} 
              className="w-full sm:w-auto"
              disabled={!patents || patents.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Database
            </Button>
            
            <Button 
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Bulk Template
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <SearchFilters 
            onSearch={handleSearch}
            placeholder="Search patents..."
            searchFields={searchFields}
          />
        </div>
        
        {isLoading ? (
          <LoadingState message="Loading patents..." />
        ) : error ? (
          <EmptyState 
            title="Error loading patents" 
            description="An error occurred while loading the patents. Please try again." 
          />
        ) : patents && patents.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Patent Title</TableHead>
                    <TableHead>App. No.</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>PS Status</TableHead>
                    <TableHead>CS Status</TableHead>
                    <TableHead>FER Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatents.map((patent) => (
                    <TableRow key={patent.id}>
                      <TableCell className="font-medium">{patent.tracking_id}</TableCell>
                      <TableCell>{patent.patent_applicant}</TableCell>
                      <TableCell>{patent.client_id}</TableCell>
                      <TableCell>{patent.patent_title}</TableCell>
                      <TableCell>{patent.application_no || '-'}</TableCell>
                      <TableCell>{patent.date_of_filing || '-'}</TableCell>
                      <TableCell>{patent.ps_completion_status ? 'Completed' : 'Pending'}</TableCell>
                      <TableCell>{patent.cs_completion_status ? 'Completed' : 'Pending'}</TableCell>
                      <TableCell>{patent.fer_status ? 'Active' : 'Not Required'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyState 
            title="No patents found" 
            description="There are no patents in the database or matching your search criteria." 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Sheets;
