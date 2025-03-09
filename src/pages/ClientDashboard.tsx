
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
      withdrawn: false, // Added admin-markable status
      idfSent: false,   // Added admin-markable status
      idfReceived: false, // Added admin-markable status
      csDataSent: false, // Added admin-markable status
      csDataReceived: false, // Added admin-markable status
    },
    paymentStatus: {
      notSent: false,
      sent: false,
      received: false,
      invoiceSent: false, // Added admin-markable status
    },
    draftingStatus: {
      psDrafting: false,
      csDrafting: false,
      ferDrafting: false,
      psDraftingReview: false, // Added admin-markable review status
      csDraftingReview: false, // Added admin-markable review status
      ferDraftingReview: false, // Added admin-markable review status
    },
    filingStatus: {
      psFiling: false,
      csFiling: false,
      ferFiling: false,
      psFilingReview: false, // Added admin-markable review status
      csFilingReview: false, // Added admin-markable review status
      ferFilingReview: false, // Added admin-markable review status
    },
    formStatus: {
      form26: false, // Added form status that admin marks
      form18: false,
      form18a: false,
      form9: false,
      form9a: false,
      form13: false,
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
      // Patent Status Filtering - Added admin-markable statuses
      if (
        (filters.patentStatus.completed && !isPatentCompleted(patent)) ||
        (filters.patentStatus.inProgress && !isPatentInProgress(patent)) ||
        (filters.patentStatus.notStarted && !isPatentNotStarted(patent)) ||
        (filters.patentStatus.withdrawn && !patent.withdrawn) ||
        (filters.patentStatus.idfSent && !patent.idf_sent) ||
        (filters.patentStatus.idfReceived && !patent.idf_received) ||
        (filters.patentStatus.csDataSent && !patent.cs_data) ||
        (filters.patentStatus.csDataReceived && !patent.cs_data_received)
      ) {
        if (
          filters.patentStatus.completed || 
          filters.patentStatus.inProgress || 
          filters.patentStatus.notStarted ||
          filters.patentStatus.withdrawn ||
          filters.patentStatus.idfSent ||
          filters.patentStatus.idfReceived ||
          filters.patentStatus.csDataSent ||
          filters.patentStatus.csDataReceived
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
      
      // Form Status Filtering - Added form statuses that admin marks
      if (
        (filters.formStatus.form26 && !patent.form_26) ||
        (filters.formStatus.form18 && !patent.form_18) ||
        (filters.formStatus.form18a && !patent.form_18a) ||
        (filters.formStatus.form9 && !patent.form_9) ||
        (filters.formStatus.form9a && !patent.form_9a) ||
        (filters.formStatus.form13 && !patent.form_13)
      ) {
        if (
          filters.formStatus.form26 ||
          filters.formStatus.form18 ||
          filters.formStatus.form18a ||
          filters.formStatus.form9 ||
          filters.formStatus.form9a ||
          filters.formStatus.form13
        ) {
          return false;
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
        csDataSent: false,
        csDataReceived: false,
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
        form26: false,
        form18: false,
        form18a: false,
        form9: false,
        form9a: false,
        form13: false,
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
    Object.values(filters.formStatus).forEach(value => { if (value) count++; }); // Count form status filters
    
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
                        <div>
                          <h5 className="mb-2 text-sm font-medium">Search</h5>
                          <Input 
                            placeholder="Search tracking ID, title, etc."
                            value={filters.searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full"
                          />
                        </div>

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
                                  handleFilterChange('paymentStatus', 'notSent', checked)
                                }
                              />
                              <label htmlFor="notSent" className="ml-2 text-sm">Not Sent</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="sent"
                                checked={filters.paymentStatus.sent}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('paymentStatus', 'sent', checked)
                                }
                              />
                              <label htmlFor="sent" className="ml-2 text-sm">Sent</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="received"
                                checked={filters.paymentStatus.received}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('paymentStatus', 'received', checked)
                                }
                              />
                              <label htmlFor="received" className="ml-2 text-sm">Received</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="invoiceSent"
                                checked={filters.paymentStatus.invoiceSent}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('paymentStatus', 'invoiceSent', checked)
                                }
                              />
                              <label htmlFor="invoiceSent" className="ml-2 text-sm">Invoice Sent</label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-2 text-sm font-medium">Drafting Status</h5>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Checkbox 
                                id="psDrafting"
                                checked={filters.draftingStatus.psDrafting}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('draftingStatus', 'psDrafting', checked)
                                }
                              />
                              <label htmlFor="psDrafting" className="ml-2 text-sm">PS Drafting Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csDrafting"
                                checked={filters.draftingStatus.csDrafting}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('draftingStatus', 'csDrafting', checked)
                                }
                              />
                              <label htmlFor="csDrafting" className="ml-2 text-sm">CS Drafting Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="ferDrafting"
                                checked={filters.draftingStatus.ferDrafting}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('draftingStatus', 'ferDrafting', checked)
                                }
                              />
                              <label htmlFor="ferDrafting" className="ml-2 text-sm">FER Drafting Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="psDraftingReview"
                                checked={filters.draftingStatus.psDraftingReview}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('draftingStatus', 'psDraftingReview', checked)
                                }
                              />
                              <label htmlFor="psDraftingReview" className="ml-2 text-sm">PS Drafting Under Review</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csDraftingReview"
                                checked={filters.draftingStatus.csDraftingReview}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('draftingStatus', 'csDraftingReview', checked)
                                }
                              />
                              <label htmlFor="csDraftingReview" className="ml-2 text-sm">CS Drafting Under Review</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="ferDraftingReview"
                                checked={filters.draftingStatus.ferDraftingReview}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('draftingStatus', 'ferDraftingReview', checked)
                                }
                              />
                              <label htmlFor="ferDraftingReview" className="ml-2 text-sm">FER Drafting Under Review</label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-2 text-sm font-medium">Filing Status</h5>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Checkbox 
                                id="psFiling"
                                checked={filters.filingStatus.psFiling}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('filingStatus', 'psFiling', checked)
                                }
                              />
                              <label htmlFor="psFiling" className="ml-2 text-sm">PS Filing Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csFiling"
                                checked={filters.filingStatus.csFiling}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('filingStatus', 'csFiling', checked)
                                }
                              />
                              <label htmlFor="csFiling" className="ml-2 text-sm">CS Filing Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="ferFiling"
                                checked={filters.filingStatus.ferFiling}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('filingStatus', 'ferFiling', checked)
                                }
                              />
                              <label htmlFor="ferFiling" className="ml-2 text-sm">FER Filing Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="psFilingReview"
                                checked={filters.filingStatus.psFilingReview}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('filingStatus', 'psFilingReview', checked)
                                }
                              />
                              <label htmlFor="psFilingReview" className="ml-2 text-sm">PS Filing Under Review</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="csFilingReview"
                                checked={filters.filingStatus.csFilingReview}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('filingStatus', 'csFilingReview', checked)
                                }
                              />
                              <label htmlFor="csFilingReview" className="ml-2 text-sm">CS Filing Under Review</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="ferFilingReview"
                                checked={filters.filingStatus.ferFilingReview}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('filingStatus', 'ferFilingReview', checked)
                                }
                              />
                              <label htmlFor="ferFilingReview" className="ml-2 text-sm">FER Filing Under Review</label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="mb-2 text-sm font-medium">Form Status</h5>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Checkbox 
                                id="form26"
                                checked={filters.formStatus.form26}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('formStatus', 'form26', checked)
                                }
                              />
                              <label htmlFor="form26" className="ml-2 text-sm">Form 26 Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="form18"
                                checked={filters.formStatus.form18}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('formStatus', 'form18', checked)
                                }
                              />
                              <label htmlFor="form18" className="ml-2 text-sm">Form 18 Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="form18a"
                                checked={filters.formStatus.form18a}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('formStatus', 'form18a', checked)
                                }
                              />
                              <label htmlFor="form18a" className="ml-2 text-sm">Form 18A Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="form9"
                                checked={filters.formStatus.form9}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('formStatus', 'form9', checked)
                                }
                              />
                              <label htmlFor="form9" className="ml-2 text-sm">Form 9 Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="form9a"
                                checked={filters.formStatus.form9a}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('formStatus', 'form9a', checked)
                                }
                              />
                              <label htmlFor="form9a" className="ml-2 text-sm">Form 9A Completed</label>
                            </div>
                            <div className="flex items-center">
                              <Checkbox 
                                id="form13"
                                checked={filters.formStatus.form13}
                                onCheckedChange={(checked) => 
                                  handleFilterChange('formStatus', 'form13', checked)
                                }
                              />
                              <label htmlFor="form13" className="ml-2 text-sm">Form 13 Completed</label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-2 text-sm font-medium">Filing Date Range</h5>
                          <div className="space-y-2">
                            <div className="flex flex-col">
                              <label htmlFor="startDate" className="mb-1 text-xs">Start Date</label>
                              <Input 
                                type="date"
                                id="startDate"
                                value={filters.dateRange.startDate}
                                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label htmlFor="endDate" className="mb-1 text-xs">End Date</label>
                              <Input 
                                type="date"
                                id="endDate"
                                value={filters.dateRange.endDate}
                                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={handleExportToExcel} 
                variant="outline" 
                className="w-full md:w-auto"
                disabled={filteredPatents.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </>
          )}
        </div>
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

              {activeFiltersCount > 0 && (
                <div className="mb-4 p-3 bg-muted rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredPatents.length} results with {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
                    <X className="h-3 w-3 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}

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
              message={`There are no patents matching your filters for client ${selectedClient}`}
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
