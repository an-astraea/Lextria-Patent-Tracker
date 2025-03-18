import { Patent } from '@/lib/types';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

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
}

export const isPatentCompleted = (patent: Patent): boolean => {
  return patent.ps_completion_status === 1 && patent.cs_completion_status === 1;
};

export const isPatentInProgress = (patent: Patent): boolean => {
  return (
    (patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 || patent.fer_drafter_status === 1) && 
    (patent.ps_filing_status === 0 || patent.cs_filing_status === 0 || patent.fer_filing_status === 0)
  );
};

export const isPatentNotStarted = (patent: Patent): boolean => {
  return patent.ps_drafting_status === 0 && patent.cs_drafting_status === 0;
};

export const applyFilters = (patents: Patent[], filters: FilterState): Patent[] => {
  return patents.filter(patent => {
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

    const anyFormFilterActive = Object.values(filters.formStatus).some(value => value);
    
    if (anyFormFilterActive) {
      for (const [key, value] of Object.entries(filters.formStatus)) {
        if (value && !formFields[key]) {
          return false;
        }
      }
    }

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

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        patent.tracking_id?.toLowerCase().includes(query) ||
        (patent.internal_tracking_id && patent.internal_tracking_id.toLowerCase().includes(query)) ||
        patent.patent_title?.toLowerCase().includes(query) ||
        patent.patent_applicant?.toLowerCase().includes(query) ||
        patent.client_id?.toLowerCase().includes(query) ||
        (patent.application_no && patent.application_no.toLowerCase().includes(query)) ||
        (patent.applicant_addr && patent.applicant_addr.toLowerCase().includes(query)) ||
        (patent.inventor_ph_no && patent.inventor_ph_no.toLowerCase().includes(query)) ||
        (patent.inventor_email && patent.inventor_email.toLowerCase().includes(query)) ||
        (patent.ps_drafter_assgn && patent.ps_drafter_assgn.toLowerCase().includes(query)) ||
        (patent.ps_filer_assgn && patent.ps_filer_assgn.toLowerCase().includes(query)) ||
        (patent.cs_drafter_assgn && patent.cs_drafter_assgn.toLowerCase().includes(query)) ||
        (patent.cs_filer_assgn && patent.cs_filer_assgn.toLowerCase().includes(query)) ||
        (patent.fer_drafter_assgn && patent.fer_drafter_assgn.toLowerCase().includes(query)) ||
        (patent.fer_filer_assgn && patent.fer_filer_assgn.toLowerCase().includes(query)) ||
        (patent.date_of_filing && patent.date_of_filing.toLowerCase().includes(query)) ||
        (patent.ps_drafter_deadline && patent.ps_drafter_deadline.toLowerCase().includes(query)) ||
        (patent.ps_filer_deadline && patent.ps_filer_deadline.toLowerCase().includes(query)) ||
        (patent.cs_drafter_deadline && patent.cs_drafter_deadline.toLowerCase().includes(query)) ||
        (patent.cs_filer_deadline && patent.cs_filer_deadline.toLowerCase().includes(query)) ||
        (patent.fer_drafter_deadline && patent.fer_drafter_deadline.toLowerCase().includes(query)) ||
        (patent.fer_filer_deadline && patent.fer_filer_deadline.toLowerCase().includes(query))
      );
    }

    return true;
  });
};

export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;
  
  Object.values(filters.patentStatus).forEach(value => { if (value) count++; });
  Object.values(filters.paymentStatus).forEach(value => { if (value) count++; });
  Object.values(filters.draftingStatus).forEach(value => { if (value) count++; });
  Object.values(filters.filingStatus).forEach(value => { if (value) count++; });
  Object.values(filters.formStatus).forEach(value => { if (value) count++; });
  
  if (filters.dateRange.startDate) count++;
  if (filters.dateRange.endDate) count++;
  
  if (filters.searchQuery) count++;
  
  return count;
};

export const initializeFormFilters = (): Record<string, boolean> => {
  return {
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
  };
};

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
    formStatus: initializeFormFilters(),
    dateRange: {
      startDate: '',
      endDate: '',
    },
    searchQuery: '',
  };
};

export const generateExcelData = (patents: Patent[]): any[] => {
  if (patents.length === 0) return [];

  return patents.map(patent => {
    const baseData = {
      'Tracking ID': patent.tracking_id,
      'Internal Tracking ID': patent.internal_tracking_id || 'N/A',
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
};
