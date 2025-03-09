<lov-code>
import React, { useState, useEffect } from 'react';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, PieChart, FileText, Users, Clock, Filter, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatentCard from '@/components/PatentCard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import * as XLSX from 'xlsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const ClientDashboard = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    patentStatus: {
      completed: false,
      inProgress: false,
      notStarted: false,
      withdrawn: false,
      idfSent: false,
      idfReceived: false,
      idfSentNotReceived: false, // New filter for IDF sent but not received
      csDataSent: false,
      csDataReceived: false,
      csDataSentNotReceived: false, // New filter for CS data sent but not received
    },
    paymentStatus: {
      notSent: false,
      sent: false,
      received: false,
      invoiceSent: false,
    },
    draftingStatus: {
      psDrafting: false,
      csDrafting: false,
      ferDrafting: false,
      psDraftingReview: false,
      csDraftingReview: false,
      ferDraftingReview: false,
    },
    filingStatus: {
      psFiling: false,
      csFiling: false,
      ferFiling: false,
      psFilingReview: false,
      csFilingReview: false,
      ferFilingReview: false,
    },
    formStatus: {
      // Form 1 to Form 31 filters
      form1: false,
      form2: false,
      form2Ps: false,
      form2Cs: false,
      form3: false,
      form4: false,
      form5: false,
      form6: false,
      form7: false,
      form7a: false,
      form8: false,
      form8a: false,
      form9: false,
      form9a: false,
      form10: false,
      form11: false,
      form12: false,
      form13: false,
      form14: false,
      form15: false,
      form16: false,
      form17: false,
      form18: false,
      form18a: false,
      form19: false,
      form20: false,
      form21: false,
      form22: false,
      form23: false,
      form24: false,
      form25: false,
      form26: false,
      form27: false,
      form28: false,
      form29: false,
      form30: false,
      form31: false,
    },
    dateRange: {
      startDate: '',
      endDate: '',
    },
    searchQuery: '',
  });

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
      clientPatents = applyFilters(clientPatents);
      
      setFilteredPatents(clientPatents);
    } else {
      setFilteredPatents([]);
    }
  }, [selectedClient, patents, filters]);

  const applyFilters = (patents: Patent[]) => {
    return patents.filter(patent => {
      // Patent Status Filtering - Include new status combinations
      if (
        (filters.patentStatus.completed && !isPatentCompleted(patent)) ||
        (filters.patentStatus.inProgress && !isPatentInProgress(patent)) ||
        (filters.patentStatus.notStarted && !isPatentNotStarted(patent)) ||
        (filters.patentStatus.withdrawn && !patent.withdrawn) ||
        (filters.patentStatus.idfSent && !patent.idf_sent) ||
        (filters.patentStatus.idfReceived && !patent.idf_received) ||
        (filters.patentStatus.idfSentNotReceived && !(patent.idf_sent === true && patent.idf_received === false)) ||
        (filters.patentStatus.csDataSent && !patent.cs_data) ||
        (filters.patentStatus.csDataReceived && !patent.cs_data_received) ||
        (filters.patentStatus.csDataSentNotReceived && !(patent.cs_data === true && patent.cs_data_received === false))
      ) {
        if (
          filters.patentStatus.completed || 
          filters.patentStatus.inProgress || 
          filters.patentStatus.notStarted ||
          filters.patentStatus.withdrawn ||
          filters.patentStatus.idfSent ||
          filters.patentStatus.idfReceived ||
          filters.patentStatus.idfSentNotReceived ||
          filters.patentStatus.csDataSent ||
          filters.patentStatus.csDataReceived ||
          filters.patentStatus.csDataSentNotReceived
        ) {
          return false;
        }
      }

      // Payment Status Filtering - Added admin-markable status
      if (
        (filters.paymentStatus.notSent && patent.payment_status !== 'not_sent') ||
        (filters.paymentStatus.sent && patent.payment_status !== 'sent') ||
        (filters.paymentStatus.received && !(patent.payment_received > 0)) ||
        (filters.paymentStatus.invoiceSent && !patent.invoice_sent)
      ) {
        if (
          filters.paymentStatus.notSent || 
          filters.paymentStatus.sent || 
          filters.paymentStatus.received ||
          filters.paymentStatus.invoiceSent
        ) {
          return false;
        }
      }

      // Drafting Status Filtering - Added review status
      if (
        (filters.draftingStatus.psDrafting && patent.ps_drafting_status !== 1) ||
        (filters.draftingStatus.csDrafting && patent.cs_drafting_status !== 1) ||
        (filters.draftingStatus.ferDrafting && patent.fer_drafter_status !== 1) ||
        (filters.draftingStatus.psDraftingReview && patent.ps_review_draft_status !== 1) ||
        (filters.draftingStatus.csDraftingReview && patent.cs_review_draft_status !== 1) ||
        (filters.draftingStatus.ferDraftingReview && patent.fer_review_draft_status !== 1)
      ) {
        if (
          filters.draftingStatus.psDrafting || 
          filters.draftingStatus.csDrafting || 
          filters.draftingStatus.ferDrafting ||
          filters.draftingStatus.psDraftingReview ||
          filters.draftingStatus.csDraftingReview ||
          filters.draftingStatus.ferDraftingReview
        ) {
          return false;
        }
      }

      // Filing Status Filtering - Added review status
      if (
        (filters.filingStatus.psFiling && patent.ps_filing_status !== 1) ||
        (filters.filingStatus.csFiling && patent.cs_filing_status !== 1) ||
        (filters.filingStatus.ferFiling && patent.fer_filing_status !== 1) ||
        (filters.filingStatus.psFilingReview && patent.ps_review_file_status !== 1) ||
        (filters.filingStatus.csFilingReview && patent.cs_review_file_status !== 1) ||
        (filters.filingStatus.ferFilingReview && patent.fer_review_file_status !== 1)
      ) {
        if (
          filters.filingStatus.psFiling || 
          filters.filingStatus.csFiling || 
          filters.filingStatus.ferFiling ||
          filters.filingStatus.psFilingReview ||
          filters.filingStatus.csFilingReview ||
          filters.filingStatus.ferFilingReview
        ) {
          return false;
        }
      }
      
      // Form Status Filtering - All forms
      const formFields = {
        form1: patent.form_1 || patent.form_01,
        form2: patent.form_2,
        form2Ps: patent.form_2_ps || patent.form_02_ps,
        form2Cs: patent.form_2_cs || patent.form_02_cs,
        form3: patent.form_3 || patent.form_03,
        form4: patent.form_4 || patent.form_04,
        form5: patent.form_5 || patent.form_05,
        form6: patent.form_6 || patent.form_06,
        form7: patent.form_7 || patent.form_07,
        form7a: patent.form_7a || patent.form_07a,
        form8: patent.form_8 || patent.form_08,
        form8a: patent.form_8a || patent.form_08a,
        form9: patent.form_9 || patent.form_09,
        form9a: patent.form_9a || patent.form_09a,
        form10: patent.form_10,
        form11: patent.form_11,
        form12: patent.form_12,
        form13: patent.form_13,
        form14: patent.form_14,
        form15: patent.form_15,
        form16: patent.form_16,
        form17: patent.form_17,
        form18: patent.form_18,
        form18a: patent.form_18a,
        form19: patent.form_19,
        form20: patent.form_20,
        form21: patent.form_21,
        form22: patent.form_22,
        form23: patent.form_23,
        form24: patent.form_24,
        form25: patent.form_25,
        form26: patent.form_26,
        form27: patent.form_27,
        form28: patent.form_28,
        form29: patent.form_29,
        form30: patent.form_30,
        form31: patent.form_31,
      };

      // Check if any form filter is active
      const anyFormFilterActive = Object.values(filters.formStatus).some(value => value);
      
      if (anyFormFilterActive) {
        // For each form that has filter active, check if patent doesn't have that form
        for (const [key, value] of Object.entries(filters.formStatus)) {
          if (value && !formFields[key]) {
            return false;
          }
        }
      }

      // Date Range Filtering
      if (filters.dateRange.startDate && patent.date_of_filing) {
        const startDate = parseISO(filters.dateRange.startDate);
        const filingDate = parseISO(patent.date_of_filing);
        if (isBefore(filingDate, startDate)) {
          return false;
        }
      }

      if (filters.dateRange.endDate && patent.date_of_filing) {
        const endDate = parseISO(filters.dateRange.endDate);
        const filingDate = parseISO(patent.date_of_filing);
        if (isAfter(filingDate, endDate)) {
          return false;
        }
      }

      // Search Query Filtering
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          patent.tracking_id.toLowerCase().includes(query) ||
          patent.patent_title.toLowerCase().includes(query) ||
          patent.patent_applicant.toLowerCase().includes(query) ||
          (patent.application_no && patent.application_no.toLowerCase().includes(query))
        );
      }

      return true;
    });
  };

  const isPatentCompleted = (patent: Patent) => {
    return patent.ps_completion_status === 1 && patent.cs_completion_status === 1;
  };

  const isPatentInProgress = (patent: Patent) => {
    return (
      (patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1) && 
      (patent.ps_filing_status === 0 || patent.cs_filing_status === 0 || patent.fer_filing_status === 0)
    );
  };

  const isPatentNotStarted = (patent: Patent) => {
    return patent.ps_drafting_status === 0 && patent.cs_drafting_status === 0;
  };

  const handleExportToExcel = () => {
    if (filteredPatents.length === 0) return;

    const exportData = filteredPatents.map(patent => {
      const baseData = {
        'Tracking ID': patent.tracking_id,
        'Patent Applicant': patent.patent_applicant,
        'Client ID': patent.client_id,
        'Application No': patent.application_no || 'N/A',
        'Date of Filing': patent.date_of_filing || 'Not Filed Yet',
        'Patent Title': patent.patent_title,
        'Applicant Address': patent.applicant_addr,
        'Inventor Phone': patent.inventor_ph_no,
        'Inventor Email': patent.inventor_email,
        'PS Drafter': patent.ps_drafter_assgn || 'Not Assigned',
        'PS Drafter Deadline': patent.ps_drafter_deadline || 'Not Set',
        'PS Drafting Status': patent.ps_drafting_status === 1 ? 'Completed' : 'Pending',
        'PS Filer': patent.ps_filer_assgn || 'Not Assigned',
        'PS Filer Deadline': patent.ps_filer_deadline || 'Not Set',
        'PS Filing Status': patent.ps_filing_status === 1 ? 'Completed' : 'Pending',
        'CS Drafter': patent.cs_drafter_assgn || 'Not Assigned',
        'CS Drafter Deadline': patent.cs_drafter_deadline || 'Not Set',
        'CS Drafting Status': patent.cs_drafting_status === 1 ? 'Completed' : 'Pending',
        'CS Filer': patent.cs_filer_assgn || 'Not Assigned',
        'CS Filer Deadline': patent.cs_filer_deadline || 'Not Set',
        'CS Filing Status': patent.cs_filing_status === 1 ? 'Completed' : 'Pending',
        'FER Status': patent.fer_status === 1 ? 'Active' : 'Inactive',
        'FER Drafter': patent.fer_drafter_assgn || 'Not Assigned',
        'FER Drafter Deadline': patent.fer_drafter_deadline || 'Not Set',
        'FER Drafting Status': patent.fer_drafter_status === 1 ? 'Completed' : 'Pending',
        'FER Filer': patent.fer_filer_assgn || 'Not Assigned',
        'FER Filer Deadline': patent.fer_filer_deadline || 'Not Set',
        'FER Filing Status': patent.fer_filing_status === 1 ? 'Completed' : 'Pending',
        'Payment Status': patent.payment_status || 'Not Set',
        'Payment Amount': patent.payment_amount || 0,
        'Payment Received': patent.payment_received || 0,
        'Invoice Sent': patent.invoice_sent ? 'Yes' : 'No',
        'IDF Sent': patent.idf_sent ? 'Yes' : 'No',
        'IDF Received': patent.idf_received ? 'Yes' : 'No',
        'CS Data Sent': patent.cs_data ? 'Yes' : 'No',
        'CS Data Received': patent.cs_data_received ? 'Yes' : 'No',
        'Completed': patent.completed ? 'Yes' : 'No',
        'Withdrawn': patent.withdrawn ? 'Yes' : 'No',
      };
      
      const formData = {};
      
      if (patent.form_26) formData['Form 26'] = 'Yes';
      if (patent.form_18) formData['Form 18'] = 'Yes';
      if (patent.form_18a) formData['Form 18A'] = 'Yes';
      if (patent.form_9) formData['Form 9'] = 'Yes';
      if (patent.form_9a) formData['Form 9A'] = 'Yes';
      if (patent.form_13) formData['Form 13'] = 'Yes';
      
      return { ...baseData, ...formData };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedClient}_Patents`);
    
    XLSX.writeFile(workbook, `${selectedClient}_Patents_Report.xlsx`);
  };

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

  const handleSearchChange = (value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      searchQuery: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      patentStatus: {
        completed: false,
        inProgress: false,
        notStarted: false,
        withdrawn: false,
        idfSent: false,
        idfReceived: false,
        idfSentNotReceived: false,
        csDataSent: false,
        csDataReceived: false,
        csDataSentNotReceived: false,
      },
      paymentStatus: {
        notSent: false,
        sent: false,
        received: false,
        invoiceSent: false,
      },
      draftingStatus: {
        psDrafting: false,
        csDrafting: false,
        ferDrafting: false,
        psDraftingReview: false,
        csDraftingReview: false,
        ferDraftingReview: false,
      },
      filingStatus: {
        psFiling: false,
        csFiling: false,
        ferFiling: false,
        psFilingReview: false,
        csFilingReview: false,
        ferFilingReview: false,
      },
      formStatus: {
        form1: false,
        form2: false,
        form2Ps: false,
        form2Cs: false,
        form3: false,
        form4: false,
        form5: false,
        form6: false,
        form7: false,
        form7a: false,
        form8: false,
        form8a: false,
        form9: false,
        form9a: false,
        form10: false,
        form11: false,
        form12: false,
        form13: false,
        form14: false,
        form15: false,
        form16: false,
        form17: false,
        form18: false,
        form18a: false,
        form19: false,
        form20: false,
        form21: false,
        form22: false,
        form23: false,
        form24: false,
        form25: false,
        form26: false,
        form27: false,
        form28: false,
        form29: false,
        form30: false,
        form31: false,
      },
      dateRange: {
        startDate: '',
        endDate: '',
      },
      searchQuery: '',
    });
  };

  const countActiveFilters = () => {
    let count = 0;
    
    // Count status filters
    Object.values(filters.patentStatus).forEach(value => { if (value) count++; });
    Object.values(filters.paymentStatus).forEach(value => { if (value) count++; });
    Object.values(filters.draftingStatus).forEach(value => { if (value) count++; });
    Object.values(filters.filingStatus).forEach(value => { if (value) count++; });
    Object.values(filters.formStatus).forEach(value => { if (value) count++; });
    
    // Count date range filters
    if (filters.dateRange.startDate) count++;
    if (filters.dateRange.endDate) count++;
    
    // Count search query
    if (filters.searchQuery) count++;
    
    return count;
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

  const getFormCompletionPercentage = (patent: Patent) => {
    const formFields = [
      patent.form_1, patent.form_2_ps, patent.form_2_cs, patent.form_3, 
      patent.form_4, patent.form_5, patent.form_6, patent.form_7, 
      patent.form_7a, patent.form_8, patent.form_8a, patent.form_9, 
      patent.form_9a, patent.form_10, patent.form_11, patent.form_12, 
      patent.form_13, patent.form_14, patent.form_15, patent.form_16, 
      patent.form_17, patent.form_18, patent.form_18a, patent.form_19, 
      patent.form_20, patent.form_21, patent.form_22, patent.form_23, 
      patent.form_24, patent.form_25, patent.form_26, patent.form_27, 
      patent.form_28, patent.form_29, patent.form_30, patent.form_31
    ];
    
    const totalForms = formFields.length;
    const completedForms = formFields.filter(form => form === true).length;
    
    return totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
  };

  const activeFiltersCount = countActiveFilters();
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
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {selectedClient && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto relative"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px] md:w-[400px]" align="end">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Filter Patents</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="h-8 flex items-center text-xs"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Reset
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        {/* Search field */}
                        <div>
                          <h5 className="mb-2 text-sm font-medium">Search</h5>
                          <Input 
                            placeholder="Search tracking ID, title, etc."
                            value={filters.searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Patent Status Filters */}
                        <div>
                          <h5 className="mb-2 text-sm font-medium">Patent Status</h5>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Checkbox 
                                id="completed"
                                checked={filters.patentStatus.completed}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'completed', checked)
                                }
                              />
                              <label htmlFor="completed" className="ml-2 text-sm">Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="inProgress"
                                checked={filters.patentStatus.inProgress}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'inProgress', checked)
                                }
                              />
                              <label htmlFor="inProgress" className="ml-2 text-sm">In Progress</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="notStarted"
                                checked={filters.patentStatus.notStarted}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'notStarted', checked)
                                }
                              />
                              <label htmlFor="notStarted" className="ml-2 text-sm">Not Started</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="withdrawn"
                                checked={filters.patentStatus.withdrawn}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'withdrawn', checked)
                                }
                              />
                              <label htmlFor="withdrawn" className="ml-2 text-sm">Withdrawn</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="idfSent"
                                checked={filters.patentStatus.idfSent}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'idfSent', checked)
                                }
                              />
                              <label htmlFor="idfSent" className="ml-2 text-sm">IDF Sent</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="idfReceived"
                                checked={filters.patentStatus.idfReceived}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'idfReceived', checked)
                                }
                              />
                              <label htmlFor="idfReceived" className="ml-2 text-sm">IDF Received</label>
                            </div>
                            {/* New combined status filters */}
                            <div className="flex items-center">
                              <Checkbox 
                                id="idfSentNotReceived"
                                checked={filters.patentStatus.idfSentNotReceived}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'idfSentNotReceived', checked)
                                }
                              />
                              <label htmlFor="idfSentNotReceived" className="ml-2 text-sm">IDF Sent but Not Received</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csDataSent"
                                checked={filters.patentStatus.csDataSent}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'csDataSent', checked)
                                }
                              />
                              <label htmlFor="csDataSent" className="ml-2 text-sm">CS Data Sent</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csDataReceived"
                                checked={filters.patentStatus.csDataReceived}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'csDataReceived', checked)
                                }
                              />
                              <label htmlFor="csDataReceived" className="ml-2 text-sm">CS Data Received</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csDataSentNotReceived"
                                checked={filters.patentStatus.csDataSentNotReceived}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('patentStatus', 'csDataSentNotReceived', checked)
                                }
                              />
                              <label htmlFor="csDataSentNotReceived" className="ml-2 text-sm">CS Data Sent but Not Received</label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-2 text-sm font-medium">Payment Status</h5>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Checkbox 
                                id="notSent"
                                checked={filters.paymentStatus.notSent}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('paymentStatus',
