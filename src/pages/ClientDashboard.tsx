
import React, { useState, useEffect } from 'react';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import SearchFilters from '@/components/common/SearchFilters';
import * as XLSX from 'xlsx';

import ClientSelector from '@/components/client-dashboard/ClientSelector';
import FilterSection from '@/components/client-dashboard/FilterSection';
import StatsCards from '@/components/client-dashboard/StatsCards';
import PatentList from '@/components/client-dashboard/PatentList';
import { 
  FilterState, 
  applyFilters, 
  countActiveFilters, 
  initializeFilters, 
  generateExcelData 
} from '@/components/client-dashboard/utils/filterUtils';

const ClientDashboard = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initializeFilters());
  
  useEffect(() => {
    const loadPatents = async () => {
      setIsLoading(true);
      try {
        const patentsData = await fetchPatents();
        setPatents(patentsData);
        
        const uniqueClients = Array.from(
          new Set(patentsData.map((patent: Patent) => patent.client_id))
        );
        setClients(uniqueClients as string[]);
        
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
      // Filter patents by client first
      let clientPatents = patents.filter(patent => patent.client_id === selectedClient);
      
      // Apply additional filters if any are set
      clientPatents = applyFilters(clientPatents, filters);
      
      setFilteredPatents(clientPatents);
    } else {
      setFilteredPatents([]);
    }
  }, [selectedClient, patents, filters]);

  const handleFilterChange = (filterGroup, filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterGroup]: {
        ...prevFilters[filterGroup],
        [filterName]: value
      }
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      dateRange: {
        ...prevFilters.dateRange,
        [field]: value
      }
    }));
  };

  const handleSearchChange = (query: string, field?: string) => {
    console.log(`Searching for "${query}" in field: ${field || 'all'}`);
    setFilters(prevFilters => ({
      ...prevFilters,
      searchQuery: query,
      searchField: field || ''
    }));
  };

  const resetFilters = () => {
    setFilters(initializeFilters());
  };

  const handleExportToExcel = () => {
    if (filteredPatents.length === 0) return;

    const exportData = generateExcelData(filteredPatents);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedClient}_Patents`);
    
    XLSX.writeFile(workbook, `${selectedClient}_Patents_Report.xlsx`);
  };

  const activeFiltersCount = countActiveFilters(filters);

  const searchFields = [
    { value: 'tracking_id', label: 'Tracking ID' },
    { value: 'patent_title', label: 'Patent Title' },
    { value: 'patent_applicant', label: 'Applicant' },
    { value: 'application_no', label: 'Application No.' },
    { value: 'inventor_name', label: 'Inventor' },
    { value: 'inventor_email', label: 'Inventor Email' }
  ];

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full max-w-none">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <PageHeader
          title="Client Dashboard"
          subtitle="View patent statistics and details for specific clients"
        />

        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <ClientSelector 
            clients={clients} 
            selectedClient={selectedClient} 
            onClientChange={setSelectedClient} 
          />
        </div>
        
        {selectedClient && (
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              <SearchFilters 
                onSearch={handleSearchChange}
                placeholder="Search patents for this client..."
                searchFields={searchFields}
                filters={[
                  {
                    name: "Status Filters",
                    options: [
                      { value: null, label: "All Statuses" },
                      { value: "completed", label: "Completed" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "not_started", label: "Not Started" }
                    ],
                    onFilter: (value) => handleFilterChange('patentStatus', 'status', value),
                    activeFilter: filters.patentStatus.status
                  },
                  {
                    name: "Drafting Status",
                    options: [
                      { value: null, label: "All" },
                      { value: "ps_drafting", label: "PS Drafting" },
                      { value: "cs_drafting", label: "CS Drafting" },
                      { value: "fer_drafting", label: "FER Drafting" }
                    ],
                    onFilter: (value) => {
                      if (value === 'ps_drafting') {
                        handleFilterChange('draftingStatus', 'psDrafting', true);
                      } else if (value === 'cs_drafting') {
                        handleFilterChange('draftingStatus', 'csDrafting', true);
                      } else if (value === 'fer_drafting') {
                        handleFilterChange('draftingStatus', 'ferDrafting', true);
                      } else {
                        // Reset all drafting filters
                        handleFilterChange('draftingStatus', 'psDrafting', false);
                        handleFilterChange('draftingStatus', 'csDrafting', false);
                        handleFilterChange('draftingStatus', 'ferDrafting', false);
                      }
                    },
                    activeFilter: filters.draftingStatus.psDrafting ? 'ps_drafting' : 
                                 filters.draftingStatus.csDrafting ? 'cs_drafting' : 
                                 filters.draftingStatus.ferDrafting ? 'fer_drafting' : null
                  },
                  {
                    name: "Filing Status",
                    options: [
                      { value: null, label: "All" },
                      { value: "ps_filing", label: "PS Filing" },
                      { value: "cs_filing", label: "CS Filing" },
                      { value: "fer_filing", label: "FER Filing" }
                    ],
                    onFilter: (value) => {
                      if (value === 'ps_filing') {
                        handleFilterChange('filingStatus', 'psFiling', true);
                      } else if (value === 'cs_filing') {
                        handleFilterChange('filingStatus', 'csFiling', true);
                      } else if (value === 'fer_filing') {
                        handleFilterChange('filingStatus', 'ferFiling', true);
                      } else {
                        // Reset all filing filters
                        handleFilterChange('filingStatus', 'psFiling', false);
                        handleFilterChange('filingStatus', 'csFiling', false);
                        handleFilterChange('filingStatus', 'ferFiling', false);
                      }
                    },
                    activeFilter: filters.filingStatus.psFiling ? 'ps_filing' : 
                                filters.filingStatus.csFiling ? 'cs_filing' : 
                                filters.filingStatus.ferFiling ? 'fer_filing' : null
                  }
                ]}
              />
              
              <div className="flex flex-wrap gap-2">
                <FilterSection 
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  handleDateRangeChange={handleDateRangeChange}
                  handleSearchChange={handleSearchChange}
                  resetFilters={resetFilters}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>
            </div>
          </div>
        )}

        {selectedClient && filteredPatents.length > 0 && (
          <StatsCards patents={filteredPatents} />
        )}

        {selectedClient && (
          <PatentList 
            patents={filteredPatents} 
            onExportToExcel={handleExportToExcel} 
          />
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
