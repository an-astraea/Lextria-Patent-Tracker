
import React, { useState, useEffect } from 'react';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { fetchPatentsAndEmployees, deletePatent } from '@/lib/api';
import PatentListHeader from '@/components/patents/PatentListHeader';
import PatentFilters from '@/components/patents/PatentFilters';
import PatentListTabs from '@/components/patents/PatentListTabs';
import DeletePatentDialog from '@/components/patents/DeletePatentDialog';

const Patents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<string | undefined>(undefined);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [patentToDelete, setPatentToDelete] = useState<string | null>(null);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    draftingStatus: null as string | null,
    filingStatus: null as string | null,
    ferStatus: null as string | null,
    clientId: null as string | null,
    patentStatus: null as string | null,
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
  });
  
  // Define searchFields for the SearchFilters component
  const searchFields = [
    { value: 'tracking_id', label: 'Tracking ID' },
    { value: 'client_id', label: 'Client ID' },
    { value: 'patent_title', label: 'Patent Title' },
    { value: 'patent_applicant', label: 'Applicant' },
    { value: 'application_no', label: 'Application No.' },
  ];
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Fetch patents from Supabase
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const { patents } = await fetchPatentsAndEmployees();
        setPatents(patents);
        setFilteredPatents(patents);
      } catch (error) {
        console.error('Error fetching patents:', error);
        toast.error('Failed to load patents');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);
  
  // Apply filters but not search query (it will only apply on button click)
  useEffect(() => {
    let filtered = patents;
    
    // Apply drafting status filter
    if (filters.draftingStatus) {
      filtered = filtered.filter(patent => {
        if (filters.draftingStatus === 'ps_drafting_complete') {
          return patent.ps_drafting_status === 1;
        } else if (filters.draftingStatus === 'ps_drafting_pending') {
          return patent.ps_drafting_status === 0;
        } else if (filters.draftingStatus === 'cs_drafting_complete') {
          return patent.cs_drafting_status === 1;
        } else if (filters.draftingStatus === 'cs_drafting_pending') {
          return patent.cs_drafting_status === 0;
        } else if (filters.draftingStatus === 'fer_drafting_complete') {
          return patent.fer_drafter_status === 1;
        } else if (filters.draftingStatus === 'fer_drafting_pending') {
          return patent.fer_drafter_status === 0;
        }
        return true;
      });
    }
    
    // Apply filing status filter
    if (filters.filingStatus) {
      filtered = filtered.filter(patent => {
        if (filters.filingStatus === 'ps_filing_complete') {
          return patent.ps_filing_status === 1;
        } else if (filters.filingStatus === 'ps_filing_pending') {
          return patent.ps_filing_status === 0;
        } else if (filters.filingStatus === 'cs_filing_complete') {
          return patent.cs_filing_status === 1;
        } else if (filters.filingStatus === 'cs_filing_pending') {
          return patent.cs_filing_status === 0;
        } else if (filters.filingStatus === 'fer_filing_complete') {
          return patent.fer_filing_status === 1;
        } else if (filters.filingStatus === 'fer_filing_pending') {
          return patent.fer_filing_status === 0;
        }
        return true;
      });
    }
    
    // Apply FER status filter
    if (filters.ferStatus) {
      filtered = filtered.filter(patent => {
        if (filters.ferStatus === 'active') {
          return patent.fer_status === 1;
        } else if (filters.ferStatus === 'inactive') {
          return patent.fer_status === 0;
        }
        return true;
      });
    }
    
    // Apply general patent status filter
    if (filters.patentStatus) {
      filtered = filtered.filter(patent => {
        if (filters.patentStatus === 'withdrawn') {
          return patent.withdrawn === true;
        } else if (filters.patentStatus === 'idf_sent') {
          return patent.idf_sent === true;
        } else if (filters.patentStatus === 'idf_received') {
          return patent.idf_received === true;
        } else if (filters.patentStatus === 'cs_data_sent') {
          return patent.cs_data === true;
        } else if (filters.patentStatus === 'cs_data_received') {
          return patent.cs_data_received === true;
        } else if (filters.patentStatus === 'completed') {
          return patent.completed === true;
        }
        return true;
      });
    }
    
    // Apply client ID filter
    if (filters.clientId) {
      filtered = filtered.filter(patent => patent.client_id === filters.clientId);
    }
    
    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(patent => {
        const filingDate = new Date(patent.date_of_filing);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && endDate) {
          return filingDate >= startDate && filingDate <= endDate;
        } else if (startDate) {
          return filingDate >= startDate;
        } else if (endDate) {
          return filingDate <= endDate;
        }
        
        return true;
      });
    }
    
    // Apply text search filter only if there's an active search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      if (searchField) {
        // Specific field search
        switch (searchField) {
          case 'tracking_id':
            filtered = filtered.filter(patent => 
              patent.tracking_id.toLowerCase().includes(query)
            );
            break;
          case 'client_id':
            filtered = filtered.filter(patent => 
              patent.client_id.toLowerCase().includes(query)
            );
            break;
          case 'patent_title':
            filtered = filtered.filter(patent => 
              patent.patent_title.toLowerCase().includes(query)
            );
            break;
          case 'patent_applicant':
            filtered = filtered.filter(patent => 
              patent.patent_applicant.toLowerCase().includes(query)
            );
            break;
          case 'application_no':
            filtered = filtered.filter(patent => 
              patent.application_no && patent.application_no.toLowerCase().includes(query)
            );
            break;
          default:
            // If an unknown field is specified, fall back to all fields
            filtered = filtered.filter(
              (patent) =>
                patent.patent_title.toLowerCase().includes(query) ||
                patent.tracking_id.toLowerCase().includes(query) ||
                patent.patent_applicant.toLowerCase().includes(query) ||
                patent.client_id.toLowerCase().includes(query) ||
                (patent.application_no && patent.application_no.toLowerCase().includes(query)) ||
                (patent.ps_drafter_assgn && patent.ps_drafter_assgn.toLowerCase().includes(query)) ||
                (patent.ps_filer_assgn && patent.ps_filer_assgn.toLowerCase().includes(query)) ||
                (patent.cs_drafter_assgn && patent.cs_drafter_assgn.toLowerCase().includes(query)) ||
                (patent.cs_filer_assgn && patent.cs_filer_assgn.toLowerCase().includes(query)) ||
                (patent.fer_drafter_assgn && patent.fer_drafter_assgn.toLowerCase().includes(query)) ||
                (patent.fer_filer_assgn && patent.fer_filer_assgn.toLowerCase().includes(query))
            );
        }
      } else {
        // General search across all fields
        filtered = filtered.filter(
          (patent) =>
            patent.patent_title.toLowerCase().includes(query) ||
            patent.tracking_id.toLowerCase().includes(query) ||
            patent.patent_applicant.toLowerCase().includes(query) ||
            patent.client_id.toLowerCase().includes(query) ||
            (patent.application_no && patent.application_no.toLowerCase().includes(query)) ||
            (patent.ps_drafter_assgn && patent.ps_drafter_assgn.toLowerCase().includes(query)) ||
            (patent.ps_filer_assgn && patent.ps_filer_assgn.toLowerCase().includes(query)) ||
            (patent.cs_drafter_assgn && patent.cs_drafter_assgn.toLowerCase().includes(query)) ||
            (patent.cs_filer_assgn && patent.cs_filer_assgn.toLowerCase().includes(query)) ||
            (patent.fer_drafter_assgn && patent.fer_drafter_assgn.toLowerCase().includes(query)) ||
            (patent.fer_filer_assgn && patent.fer_filer_assgn.toLowerCase().includes(query))
        );
      }
    }
    
    setFilteredPatents(filtered);
  }, [searchQuery, searchField, patents, filters]);
  
  // Function to handle search execution (only on button click)
  const handleSearch = (query: string, field?: string) => {
    setSearchQuery(query);
    setSearchField(field);
  };
  
  // Handle delete patent
  const handleDeletePatent = async (id: string) => {
    try {
      const success = await deletePatent(id);
      if (success) {
        setPatents(patents.filter(patent => patent.id !== id));
        setFilteredPatents(filteredPatents.filter(patent => patent.id !== id));
        toast.success('Patent deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting patent:', error);
      toast.error('Failed to delete patent');
    }
    setPatentToDelete(null);
  };
  
  const confirmDelete = (id: string) => {
    setPatentToDelete(id);
  };
  
  const cancelDelete = () => {
    setPatentToDelete(null);
  };
  
  const clearFilters = () => {
    setFilters({
      draftingStatus: null,
      filingStatus: null,
      ferStatus: null,
      clientId: null,
      patentStatus: null,
      dateRange: {
        start: null,
        end: null,
      },
    });
    setSearchQuery('');
  };
  
  const getInProgressPatents = () => {
    return filteredPatents.filter(patent => 
      !patent.completed && !patent.withdrawn
    );
  };
  
  const getCompletedPatents = () => {
    return filteredPatents.filter(patent => 
      patent.completed === true
    );
  };
  
  const getWithdrawnPatents = () => {
    return filteredPatents.filter(patent => 
      patent.withdrawn === true
    );
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.draftingStatus) count++;
    if (filters.filingStatus) count++;
    if (filters.ferStatus) count++;
    if (filters.clientId) count++;
    if (filters.patentStatus) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (searchQuery) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PatentListHeader userRole={user?.role} />
      
      <PatentFilters 
        patents={patents}
        filters={filters}
        setFilters={setFilters}
        searchFields={searchFields}
        onSearch={handleSearch}
        getActiveFiltersCount={getActiveFiltersCount}
      />
      
      <PatentListTabs 
        filteredPatents={filteredPatents}
        getInProgressPatents={getInProgressPatents}
        getCompletedPatents={getCompletedPatents}
        getWithdrawnPatents={getWithdrawnPatents}
        onDeletePatent={confirmDelete}
        userRole={user?.role}
      />
      
      <DeletePatentDialog
        patentToDelete={patentToDelete}
        onCancel={cancelDelete}
        onConfirm={handleDeletePatent}
      />
    </div>
  );
};

export default Patents;
