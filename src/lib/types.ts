export interface Patent {
  id: string;
  tracking_id: string;
  patent_applicant: string;
  client_id: string;
  application_no?: string | null;
  date_of_filing?: string | null;
  patent_title: string;
  applicant_addr: string;
  inventor_ph_no: string;
  inventor_email: string;
  ps_drafting_status: number;
  ps_drafter_assgn?: string | null;
  ps_drafter_deadline?: string | null;
  ps_review_draft_status: number;
  ps_filing_status: number;
  ps_filer_assgn?: string | null;
  ps_filer_deadline?: string | null;
  ps_review_file_status: number;
  ps_completion_status: number;
  cs_drafting_status: number;
  cs_drafter_assgn?: string | null;
  cs_drafter_deadline?: string | null;
  cs_review_draft_status: number;
  cs_filing_status: number;
  cs_filer_assgn?: string | null;
  cs_filer_deadline?: string | null;
  cs_review_file_status: number;
  cs_completion_status: number;
  fer_status: number;
  fer_drafter_status?: number;
  fer_drafter_assgn?: string | null;
  fer_drafter_deadline?: string | null;
  fer_review_draft_status?: number;
  fer_filing_status?: number;
  fer_filer_assgn?: string | null;
  fer_filer_deadline?: string | null;
  fer_review_file_status?: number;
  fer_completion_status?: number;
  form_26?: boolean;
  form_18?: boolean;
  form_18a?: boolean;
  form_9?: boolean;
  form_9a?: boolean;
  form_13?: boolean;
  completed?: boolean;
  withdrawn?: boolean;
  payment_status?: string;
  payment_amount?: number;
  payment_received?: number;
  invoice_sent?: boolean;
  notes?: string;
  idf_sent?: boolean;
  idf_received?: boolean;
  cs_data?: boolean;
  cs_data_received?: boolean;
  created_at?: string;
  updated_at?: string;
  inventors?: InventorInfo[];
  fer_entries?: FEREntry[];
  fer_history?: FERHistory[];
}

export interface PatentFormData {
  tracking_id: string;
  patent_applicant: string;
  client_id: string;
  application_no?: string | null;
  date_of_filing?: string | null;
  patent_title: string;
  applicant_addr: string;
  inventor_ph_no: string;
  inventor_email: string;
  ps_drafter_assgn?: string | null;
  ps_drafter_deadline?: string | null;
  ps_filer_assgn?: string | null;
  ps_filer_deadline?: string | null;
  cs_drafter_assgn?: string | null;
  cs_drafter_deadline?: string | null;
  cs_filer_assgn?: string | null;
  cs_filer_deadline?: string | null;
  fer_status: number;
  fer_drafter_assgn?: string | null;
  fer_drafter_deadline?: string | null;
  fer_filer_assgn?: string | null;
  fer_filer_deadline?: string | null;
  idf_sent?: boolean;
  idf_received?: boolean;
  cs_data?: boolean;
  cs_data_received?: boolean;
  inventors: { inventor_name: string; inventor_addr: string }[];
}

export interface Employee {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password?: string;
  role: string;
}

export interface InventorInfo {
  id?: string;
  tracking_id: string;
  inventor_name: string;
  inventor_addr: string;
  created_at?: string;
  updated_at?: string;
}

export interface FEREntry {
  id: string;
  patent_id: string;
  fer_number: number;
  fer_drafter_assgn?: string | null;
  fer_drafter_deadline?: string | null;
  fer_drafter_status: number;
  fer_filer_assgn?: string | null;
  fer_filer_deadline?: string | null;
  fer_filing_status: number;
  fer_review_draft_status: number;
  fer_review_file_status: number;
  fer_completion_status: number;
  fer_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FERHistory {
  id: string;
  patent_id: string;
  fer_number: number;
  date: string;
  action: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
