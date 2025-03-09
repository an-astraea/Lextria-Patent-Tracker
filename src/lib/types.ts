
export interface Patent {
  id: string;
  tracking_id: string;
  patent_applicant: string;
  client_id: string;
  application_no: string | null;
  date_of_filing: string;
  patent_title: string;
  applicant_addr: string;
  inventor_ph_no: string;
  inventor_email: string;
  ps_drafting_status: number;
  ps_drafter_assgn: string | null;
  ps_drafter_deadline: string | null;
  ps_review_draft_status: number;
  ps_filing_status: number;
  ps_filer_assgn: string | null;
  ps_filer_deadline: string | null;
  ps_review_file_status: number;
  ps_completion_status: number;
  cs_drafting_status: number;
  cs_drafter_assgn: string | null;
  cs_drafter_deadline: string | null;
  cs_review_draft_status: number;
  cs_filing_status: number;
  cs_filer_assgn: string | null;
  cs_filer_deadline: string | null;
  form_26: boolean | null;
  form_18: boolean | null;
  form_18a: boolean | null;
  form_9: boolean | null;
  form_9a: boolean | null;
  form_13: boolean | null;
  cs_review_file_status: number;
  cs_completion_status: number;
  fer_status: number;
  fer_drafter_status: number;
  fer_drafter_assgn: string | null;
  fer_drafter_deadline: string | null;
  fer_review_draft_status: number;
  fer_filing_status: number;
  fer_filer_assgn: string | null;
  fer_filer_deadline: string | null;
  fer_review_file_status: number;
  fer_completion_status: number;
  created_at: string;
  updated_at: string;
  // Additional properties for the Patent forms
  form_01: boolean | null;
  form_02_ps: boolean | null;
  form_02_cs: boolean | null;
  form_03: boolean | null;
  form_04: boolean | null;
  form_05: boolean | null;
  form_06: boolean | null;
  form_07: boolean | null;
  form_07a: boolean | null;
  form_08: boolean | null;
  form_08a: boolean | null;
  form_09: boolean | null;
  form_09a: boolean | null;
  form_10: boolean | null;
  form_11: boolean | null;
  form_12: boolean | null;
  form_14: boolean | null;
  form_15: boolean | null;
  form_16: boolean | null;
  form_17: boolean | null;
  form_19: boolean | null;
  form_20: boolean | null;
  form_21: boolean | null;
  form_22: boolean | null;
  form_23: boolean | null;
  form_24: boolean | null;
  form_25: boolean | null;
  form_27: boolean | null;
  form_28: boolean | null;
  form_29: boolean | null;
  form_30: boolean | null;
  form_31: boolean | null;
  // Additional properties
  notes: string | null;
  inventors: Inventor[];
  fer_entries: FEREntry[];
}

export interface Inventor {
  id: string;
  tracking_id: string;
  inventor_name: string;
  inventor_addr: string;
}

export interface FERHistory {
  id: string;
  tracking_id: string;
  fer_drafter_assgn: string | null;
  fer_drafter_deadline: string | null;
  fer_filer_assgn: string | null;
  fer_filer_deadline: string | null;
  created_at: string;
}

export interface FEREntry {
  id: string;
  patent_id: string;
  fer_number: number;
  fer_date: string | null;
  fer_drafter_assgn: string | null;
  fer_drafter_deadline: string | null;
  fer_drafter_status: number;
  fer_review_draft_status: number;
  fer_filing_status: number;
  fer_filer_assgn: string | null;
  fer_filer_deadline: string | null;
  fer_review_file_status: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface PatentFormData {
  tracking_id: string;
  patent_applicant: string;
  client_id: string;
  application_no?: string;
  date_of_filing: string;
  patent_title: string;
  applicant_addr: string;
  inventor_ph_no: string;
  inventor_email: string;
  ps_drafter_assgn?: string;
  ps_drafter_deadline?: string;
  ps_filer_assgn?: string;
  ps_filer_deadline?: string;
  cs_drafter_assgn?: string;
  cs_drafter_deadline?: string;
  cs_filer_assgn?: string;
  cs_filer_deadline?: string;
  fer_status?: number;
  fer_drafter_assgn?: string;
  fer_drafter_deadline?: string;
  fer_filer_assgn?: string;
  fer_filer_deadline?: string;
  // Additional properties
  inventors?: InventorFormData[];
  notes?: string;
}

export interface InventorFormData {
  inventor_name: string;
  inventor_addr: string;
}

export interface EmployeeFormData {
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password: string;
  role: string;
}

export interface TimelineEvent {
  id: string;
  patent_id: string;
  event_type: string;
  event_description: string;
  created_at: string;
  status: number;
  employee_name?: string;
  deadline_date?: string;
}
