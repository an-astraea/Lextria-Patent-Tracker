import React, { useState } from 'react';
import { Patent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Search, X } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import EmptyState from '@/components/common/EmptyState';
import * as XLSX from 'xlsx';
import { Input } from '@/components/ui/input';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface PatentListProps {
  patents: Patent[];
  onExportToExcel: () => void;
}

const PatentList: React.FC<PatentListProps> = ({ patents, onExportToExcel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>(patents);

  React.useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = patents.filter(patent => (
        // Basic info
        patent.tracking_id?.toLowerCase().includes(query) ||
        patent.patent_title?.toLowerCase().includes(query) ||
        patent.patent_applicant?.toLowerCase().includes(query) ||
        patent.client_id?.toLowerCase().includes(query) ||
        (patent.application_no && patent.application_no.toLowerCase().includes(query)) ||
        
        // Applicant and inventor details
        (patent.applicant_addr && patent.applicant_addr.toLowerCase().includes(query)) ||
        (patent.inventor_ph_no && patent.inventor_ph_no.toLowerCase().includes(query)) ||
        (patent.inventor_email && patent.inventor_email.toLowerCase().includes(query)) ||
        
        // Employee assignments
        (patent.ps_drafter_assgn && patent.ps_drafter_assgn.toLowerCase().includes(query)) ||
        (patent.ps_filer_assgn && patent.ps_filer_assgn.toLowerCase().includes(query)) ||
        (patent.cs_drafter_assgn && patent.cs_drafter_assgn.toLowerCase().includes(query)) ||
        (patent.cs_filer_assgn && patent.cs_filer_assgn.toLowerCase().includes(query)) ||
        (patent.fer_drafter_assgn && patent.fer_drafter_assgn.toLowerCase().includes(query)) ||
        (patent.fer_filer_assgn && patent.fer_filer_assgn.toLowerCase().includes(query)) ||
        
        // Dates
        (patent.date_of_filing && patent.date_of_filing.toLowerCase().includes(query))
      ));
      setFilteredPatents(filtered);
    } else {
      setFilteredPatents(patents);
    }
  }, [searchQuery, patents]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patents by any detail..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>Search by tracking ID, internal tracking ID, patent title, applicant, client ID, application number, inventor details, or any employee assigned to the patent</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportToExcel}
          disabled={patents.length === 0}
          className="flex items-center whitespace-nowrap"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Patents</TabsTrigger>
          <TabsTrigger value="provisional">Provisional</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="fer">FER</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredPatents.length > 0 ? (
            filteredPatents.map(patent => (
              <PatentCard key={patent.id} patent={patent} showDeadline={true} />
            ))
          ) : (
            <EmptyState 
              title="No Patents Found" 
              message="No patents match your search criteria or none have been assigned to this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="provisional" className="space-y-4">
          {filteredPatents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 0).length > 0 ? (
            filteredPatents
              .filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 0)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} showDeadline={true} />
              ))
          ) : (
            <EmptyState 
              title="No Provisional Patents" 
              message="No provisional patents found for this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="complete" className="space-y-4">
          {filteredPatents.filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1).length > 0 ? (
            filteredPatents
              .filter(p => p.ps_completion_status === 1 && p.cs_completion_status === 1)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} showDeadline={true} />
              ))
          ) : (
            <EmptyState 
              title="No Complete Patents" 
              message="No complete patents found for this client." 
            />
          )}
        </TabsContent>
        
        <TabsContent value="fer" className="space-y-4">
          {filteredPatents.filter(p => p.fer_status === 1).length > 0 ? (
            filteredPatents
              .filter(p => p.fer_status === 1)
              .map(patent => (
                <PatentCard key={patent.id} patent={patent} showDeadline={true} />
              ))
          ) : (
            <EmptyState 
              title="No FER Patents" 
              message="No patents with active FER found for this client." 
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default PatentList;
