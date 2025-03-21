export interface FilterState {
  patentStatus: {
    completed: boolean;
    inProgress: boolean;
    notStarted: boolean;
    withdrawn: boolean;
    idfSent: boolean;
    idfReceived: boolean;
    idfSentNotReceived: boolean;
    csDataSent: boolean;
    csDataReceived: boolean;
    csDataSentNotReceived: boolean;
    status: string | null;
  };
  paymentStatus: {
    notSent: boolean;
    sent: boolean;
    received: boolean;
    invoiceSent: boolean;
  };
  draftingStatus: {
    psDrafting: boolean;
    csDrafting: boolean;
    ferDrafting: boolean;
    psDraftingReview: boolean;
    csDraftingReview: boolean;
    ferDraftingReview: boolean;
  };
  filingStatus: {
    psFiling: boolean;
    csFiling: boolean;
    ferFiling: boolean;
    psFilingReview: boolean;
    csFilingReview: boolean;
    ferFilingReview: boolean;
  };
  formStatus: Record<string, boolean>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  searchQuery: string;
  searchField: string;
}

export const initializeFilters = (): FilterState => {
  return {
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
      status: null
    },
    paymentStatus: {
      notSent: false,
      sent: false,
      received: false,
      invoiceSent: false
    },
    draftingStatus: {
      psDrafting: false,
      csDrafting: false,
      ferDrafting: false,
      psDraftingReview: false,
      csDraftingReview: false,
      ferDraftingReview: false
    },
    filingStatus: {
      psFiling: false,
      csFiling: false,
      ferFiling: false,
      psFilingReview: false,
      csFilingReview: false,
      ferFilingReview: false
    },
    formStatus: {
      form01: false,
      form02: false,
      form03: false,
      form04: false,
      form05: false,
      form06: false,
      form07: false,
      form08: false,
      form09: false,
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
      form31: false
    },
    dateRange: {
      startDate: '',
      endDate: ''
    },
    searchQuery: '',
    searchField: ''
  };
};

export const applyFilters = (patents: any[], filters: FilterState): any[] => {
  if (!patents.length) return [];
  
  let filteredPatents = [...patents];
  
  // Apply search filters
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    
    if (filters.searchField) {
      // Search in specific field
      filteredPatents = filteredPatents.filter(patent => {
        const fieldValue = patent[filters.searchField];
        if (fieldValue) {
          return String(fieldValue).toLowerCase().includes(query);
        }
        // Special case for inventor_name which might be in a nested array
        if (filters.searchField === 'inventor_name' && patent.inventors) {
          return patent.inventors.some((inventor: any) => 
            inventor.inventor_name.toLowerCase().includes(query)
          );
        }
        return false;
      });
    } else {
      // Search in all fields
      filteredPatents = filteredPatents.filter(patent => {
        // Search in basic fields
        const basicMatch = [
          patent.tracking_id,
          patent.patent_title,
          patent.patent_applicant,
          patent.application_no,
          patent.inventor_email,
          patent.inventor_ph_no
        ].some(field => field && String(field).toLowerCase().includes(query));
        
        // Search in inventors
        const inventorMatch = patent.inventors && patent.inventors.some((inventor: any) => 
          inventor.inventor_name.toLowerCase().includes(query)
        );
        
        return basicMatch || inventorMatch;
      });
    }
  }

  // Apply patent status filters
  if (filters.patentStatus.status) {
    switch (filters.patentStatus.status) {
      case 'completed':
        filteredPatents = filteredPatents.filter(patent => patent.completed);
        break;
      case 'in_progress':
        filteredPatents = filteredPatents.filter(patent => 
          !patent.completed && 
          (patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1)
        );
        break;
      case 'not_started':
        filteredPatents = filteredPatents.filter(patent => 
          !patent.completed && 
          patent.ps_drafting_status === 0 && 
          patent.cs_drafting_status === 0 && 
          patent.fer_drafter_status === 0
        );
        break;
    }
  }
  
  // Apply patent status filters
  if (filters.patentStatus.completed) {
    filteredPatents = filteredPatents.filter(patent => patent.completed);
  }
  if (filters.patentStatus.inProgress) {
    filteredPatents = filteredPatents.filter(patent => 
      !patent.completed && 
      (patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1)
    );
  }
  if (filters.patentStatus.notStarted) {
    filteredPatents = filteredPatents.filter(patent => 
      !patent.completed && 
      patent.ps_drafting_status === 0 && 
      patent.cs_drafting_status === 0 && 
      patent.fer_drafter_status === 0
    );
  }
  if (filters.patentStatus.withdrawn) {
    filteredPatents = filteredPatents.filter(patent => patent.withdrawn);
  }
  if (filters.patentStatus.idfSent) {
    filteredPatents = filteredPatents.filter(patent => patent.idf_sent);
  }
  if (filters.patentStatus.idfReceived) {
    filteredPatents = filteredPatents.filter(patent => patent.idf_received);
  }
  if (filters.patentStatus.idfSentNotReceived) {
    filteredPatents = filteredPatents.filter(patent => patent.idf_sent && !patent.idf_received);
  }
  if (filters.patentStatus.csDataSent) {
    filteredPatents = filteredPatents.filter(patent => patent.cs_data);
  }
  if (filters.patentStatus.csDataReceived) {
    filteredPatents = filteredPatents.filter(patent => patent.cs_data_received);
  }
  if (filters.patentStatus.csDataSentNotReceived) {
    filteredPatents = filteredPatents.filter(patent => patent.cs_data && !patent.cs_data_received);
  }
  
  // Apply payment status filters
  if (filters.paymentStatus.notSent) {
    filteredPatents = filteredPatents.filter(patent => patent.payment_status === 'not_sent');
  }
  if (filters.paymentStatus.sent) {
    filteredPatents = filteredPatents.filter(patent => patent.payment_status === 'sent');
  }
  if (filters.paymentStatus.received) {
    filteredPatents = filteredPatents.filter(patent => patent.payment_status === 'received');
  }
  if (filters.paymentStatus.invoiceSent) {
    filteredPatents = filteredPatents.filter(patent => patent.invoice_sent);
  }
  
  // Apply drafting status filters
  if (filters.draftingStatus.psDrafting) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.ps_drafting_status === 0 && patent.ps_drafter_assgn
    );
  }
  if (filters.draftingStatus.csDrafting) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.cs_drafting_status === 0 && patent.cs_drafter_assgn
    );
  }
  if (filters.draftingStatus.ferDrafting) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.fer_drafter_status === 0 && patent.fer_drafter_assgn
    );
  }
  if (filters.draftingStatus.psDraftingReview) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.ps_review_draft_status === 1
    );
  }
  if (filters.draftingStatus.csDraftingReview) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.cs_review_draft_status === 1
    );
  }
  if (filters.draftingStatus.ferDraftingReview) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.fer_review_draft_status === 1
    );
  }
  
  // Apply filing status filters
  if (filters.filingStatus.psFiling) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.ps_filing_status === 0 && patent.ps_filer_assgn && patent.ps_drafting_status === 1
    );
  }
  if (filters.filingStatus.csFiling) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.cs_filing_status === 0 && patent.cs_filer_assgn && patent.cs_drafting_status === 1
    );
  }
  if (filters.filingStatus.ferFiling) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.fer_filing_status === 0 && patent.fer_filer_assgn && patent.fer_drafter_status === 1
    );
  }
  if (filters.filingStatus.psFilingReview) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.ps_review_file_status === 1
    );
  }
  if (filters.filingStatus.csFilingReview) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.cs_review_file_status === 1
    );
  }
  if (filters.filingStatus.ferFilingReview) {
    filteredPatents = filteredPatents.filter(patent => 
      patent.fer_review_file_status === 1
    );
  }
  
  // Apply form status filters
  const activeFormFilters = Object.entries(filters.formStatus).filter(([, value]) => value);
  if (activeFormFilters.length > 0) {
    filteredPatents = filteredPatents.filter(patent => {
      return activeFormFilters.every(([formKey, _]) => {
        const dbKey = formKey.replace(/([A-Z])/g, '_$1').toLowerCase();
        return patent[dbKey];
      });
    });
  }
  
  // Apply date range filters
  if (filters.dateRange.startDate) {
    const startDate = new Date(filters.dateRange.startDate);
    filteredPatents = filteredPatents.filter(patent => {
      if (!patent.date_of_filing) return false;
      const filingDate = new Date(patent.date_of_filing);
      return filingDate >= startDate;
    });
  }
  if (filters.dateRange.endDate) {
    const endDate = new Date(filters.dateRange.endDate);
    // Set to end of day
    endDate.setHours(23, 59, 59, 999);
    filteredPatents = filteredPatents.filter(patent => {
      if (!patent.date_of_filing) return false;
      const filingDate = new Date(patent.date_of_filing);
      return filingDate <= endDate;
    });
  }
  
  return filteredPatents;
};

export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;
  
  // Count patent status filters
  Object.values(filters.patentStatus).forEach(value => {
    if (value) count++;
  });
  
  // Count payment status filters
  Object.values(filters.paymentStatus).forEach(value => {
    if (value) count++;
  });
  
  // Count drafting status filters
  Object.values(filters.draftingStatus).forEach(value => {
    if (value) count++;
  });
  
  // Count filing status filters
  Object.values(filters.filingStatus).forEach(value => {
    if (value) count++;
  });
  
  // Count form status filters
  Object.entries(filters.formStatus).forEach(([, value]) => {
    if (value) count++;
  });
  
  // Count date range filters
  if (filters.dateRange.startDate) count++;
  if (filters.dateRange.endDate) count++;
  
  // Count search query
  if (filters.searchQuery) count++;
  
  return count;
};

export const generateExcelData = (patents: any[]) => {
  return patents.map(patent => ({
    "Tracking ID": patent.tracking_id,
    "Patent Title": patent.patent_title,
    "Client ID": patent.client_id,
    "Applicant": patent.patent_applicant,
    "Application Number": patent.application_no,
    "Date of Filing": patent.date_of_filing,
    "Inventor Names": patent.inventors?.map((inventor: any) => inventor.inventor_name).join(', ') || '',
    "Inventor Emails": patent.inventors?.map((inventor: any) => inventor.inventor_email).join(', ') || '',
    "PS Drafting Status": patent.ps_drafting_status,
    "CS Drafting Status": patent.cs_drafting_status,
    "FER Drafting Status": patent.fer_drafter_status,
    "Payment Status": patent.payment_status,
    "Invoice Sent": patent.invoice_sent,
    "Completed": patent.completed,
    "Withdrawn": patent.withdrawn,
    "IDF Sent": patent.idf_sent,
    "IDF Received": patent.idf_received,
    "CS Data": patent.cs_data,
    "CS Data Received": patent.cs_data_received,
  }));
};
