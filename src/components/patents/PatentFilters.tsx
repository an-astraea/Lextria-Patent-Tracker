
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import SearchFilters from '@/components/common/SearchFilters';
import { Patent } from '@/lib/types';

interface PatentFiltersProps {
  patents: Patent[];
  filters: {
    draftingStatus: string | null;
    filingStatus: string | null;
    ferStatus: string | null;
    clientId: string | null;
    patentStatus: string | null;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    draftingStatus: string | null;
    filingStatus: string | null;
    ferStatus: string | null;
    clientId: string | null;
    patentStatus: string | null;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  }>>;
  searchFields: Array<{ value: string; label: string }>;
  onSearch: (query: string, field?: string) => void;
  getActiveFiltersCount: () => number;
}

const PatentFilters: React.FC<PatentFiltersProps> = ({ 
  patents,
  filters, 
  setFilters, 
  searchFields, 
  onSearch,
  getActiveFiltersCount
}) => {
  // Calculate counts for each filter option
  const filterOptionsWithCounts = useMemo(() => {
    // Count patents by client ID
    const clientCounts = patents.reduce((acc, patent) => {
      acc[patent.client_id] = (acc[patent.client_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count patents by status
    const statusCounts = {
      completed: patents.filter(p => p.completed === true).length,
      withdrawn: patents.filter(p => p.withdrawn === true).length,
      idf_sent: patents.filter(p => p.idf_sent === true).length,
      idf_received: patents.filter(p => p.idf_received === true).length,
      cs_data_sent: patents.filter(p => p.cs_data === true).length,
      cs_data_received: patents.filter(p => p.cs_data_received === true).length,
    };

    // Count patents by drafting status
    const draftingCounts = {
      ps_drafting_complete: patents.filter(p => p.ps_drafting_status === 1).length,
      ps_drafting_pending: patents.filter(p => p.ps_drafting_status === 0).length,
      cs_drafting_complete: patents.filter(p => p.cs_drafting_status === 1).length,
      cs_drafting_pending: patents.filter(p => p.cs_drafting_status === 0).length,
      fer_drafting_complete: patents.filter(p => p.fer_drafter_status === 1).length,
      fer_drafting_pending: patents.filter(p => p.fer_drafter_status === 0).length,
    };

    // Count patents by filing status
    const filingCounts = {
      ps_filing_complete: patents.filter(p => p.ps_filing_status === 1).length,
      ps_filing_pending: patents.filter(p => p.ps_filing_status === 0).length,
      cs_filing_complete: patents.filter(p => p.cs_filing_status === 1).length,
      cs_filing_pending: patents.filter(p => p.cs_filing_status === 0).length,
      fer_filing_complete: patents.filter(p => p.fer_filing_status === 1).length,
      fer_filing_pending: patents.filter(p => p.fer_filing_status === 0).length,
    };

    // Count patents by FER status
    const ferCounts = {
      active: patents.filter(p => p.fer_status === 1).length,
      inactive: patents.filter(p => p.fer_status === 0).length,
    };

    return {
      clientOptions: Object.keys(clientCounts).map(clientId => ({
        value: clientId,
        label: clientId,
        count: clientCounts[clientId]
      })),
      statusOptions: [
        { value: null, label: "All Statuses", count: patents.length },
        { value: "completed", label: "Completed", count: statusCounts.completed },
        { value: "withdrawn", label: "Withdrawn", count: statusCounts.withdrawn },
        { value: "idf_sent", label: "IDF Sent", count: statusCounts.idf_sent },
        { value: "idf_received", label: "IDF Received", count: statusCounts.idf_received },
        { value: "cs_data_sent", label: "CS Data Sent", count: statusCounts.cs_data_sent },
        { value: "cs_data_received", label: "CS Data Received", count: statusCounts.cs_data_received }
      ],
      draftingOptions: [
        { value: null, label: "All", count: patents.length },
        { value: "ps_drafting_complete", label: "PS Drafting Complete", count: draftingCounts.ps_drafting_complete },
        { value: "ps_drafting_pending", label: "PS Drafting Pending", count: draftingCounts.ps_drafting_pending },
        { value: "cs_drafting_complete", label: "CS Drafting Complete", count: draftingCounts.cs_drafting_complete },
        { value: "cs_drafting_pending", label: "CS Drafting Pending", count: draftingCounts.cs_drafting_pending },
        { value: "fer_drafting_complete", label: "FER Drafting Complete", count: draftingCounts.fer_drafting_complete },
        { value: "fer_drafting_pending", label: "FER Drafting Pending", count: draftingCounts.fer_drafting_pending }
      ],
      filingOptions: [
        { value: null, label: "All", count: patents.length },
        { value: "ps_filing_complete", label: "PS Filing Complete", count: filingCounts.ps_filing_complete },
        { value: "ps_filing_pending", label: "PS Filing Pending", count: filingCounts.ps_filing_pending },
        { value: "cs_filing_complete", label: "CS Filing Complete", count: filingCounts.cs_filing_complete },
        { value: "cs_filing_pending", label: "CS Filing Pending", count: filingCounts.cs_filing_pending },
        { value: "fer_filing_complete", label: "FER Filing Complete", count: filingCounts.fer_filing_complete },
        { value: "fer_filing_pending", label: "FER Filing Pending", count: filingCounts.fer_filing_pending }
      ],
      ferOptions: [
        { value: null, label: "All", count: patents.length },
        { value: "active", label: "Active", count: ferCounts.active },
        { value: "inactive", label: "Inactive", count: ferCounts.inactive }
      ]
    };
  }, [patents]);

  const filtersWithCounts = [
    {
      name: "Client ID",
      options: [
        { value: null, label: "All Clients", count: patents.length },
        ...filterOptionsWithCounts.clientOptions
      ],
      onFilter: (value: string | null) => setFilters({...filters, clientId: value}),
      activeFilter: filters.clientId
    },
    {
      name: "Status",
      options: filterOptionsWithCounts.statusOptions,
      onFilter: (value: string | null) => setFilters({...filters, patentStatus: value}),
      activeFilter: filters.patentStatus
    },
    {
      name: "Drafting Status",
      options: filterOptionsWithCounts.draftingOptions,
      onFilter: (value: string | null) => setFilters({...filters, draftingStatus: value}),
      activeFilter: filters.draftingStatus
    },
    {
      name: "Filing Status", 
      options: filterOptionsWithCounts.filingOptions,
      onFilter: (value: string | null) => setFilters({...filters, filingStatus: value}),
      activeFilter: filters.filingStatus
    },
    {
      name: "FER Status",
      options: filterOptionsWithCounts.ferOptions,
      onFilter: (value: string | null) => setFilters({...filters, ferStatus: value}),
      activeFilter: filters.ferStatus
    }
  ];

  return (
    <>
      <SearchFilters 
        onSearch={onSearch} 
        placeholder="Search patents..."
        searchFields={searchFields}
        filters={filtersWithCounts}
      />
      
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.patentStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.patentStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, patentStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.draftingStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Drafting: {filters.draftingStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, draftingStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.filingStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Filing: {filters.filingStatus.replace('_', ' ')}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, filingStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.ferStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              FER: {filters.ferStatus}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, ferStatus: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.clientId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Client: {filters.clientId}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, clientId: null})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.dateRange.start || 'Any'} to {filters.dateRange.end || 'Any'}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({...filters, dateRange: {start: null, end: null}})}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </>
  );
};

export default PatentFilters;
