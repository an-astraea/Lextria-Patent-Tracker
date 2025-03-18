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
  // Status flow fields
  pending_cs_confirmation?: boolean; // Sent CS for confirmation
  cs_confirmed?: boolean;            // CS confirmed 
  pending_ps_confirmation?: boolean; // Sent PS for confirmation
  ps_confirmed?: boolean;            // PS confirmed
  // Form fields
  form_1?: boolean;
  form_2?: boolean;
  form_2_ps?: boolean;
  form_2_cs?: boolean;
  form_3?: boolean;
  form_4?: boolean;
  form_5?: boolean;
  form_6?: boolean;
  form_7?: boolean;
  form_7a?: boolean;
  form_8?: boolean;
  form_8a?: boolean;
  form_9?: boolean;
  form_9a?: boolean;
  form_10?: boolean;
  form_11?: boolean;
  form_12?: boolean;
  form_13?: boolean;
  form_14?: boolean;
  form_15?: boolean;
  form_16?: boolean;
  form_17?: boolean;
  form_18?: boolean;
  form_18a?: boolean;
  form_19?: boolean;
  form_20?: boolean;
  form_21?: boolean;
  form_22?: boolean;
  form_23?: boolean;
  form_24?: boolean;
  form_25?: boolean;
  form_26?: boolean;
  form_27?: boolean;
  form_28?: boolean;
  form_29?: boolean;
  form_30?: boolean;
  form_31?: boolean;
  // For backwards compatibility with any existing code
  form_01?: boolean;
  form_02_ps?: boolean;
  form_02_cs?: boolean;
  form_03?: boolean;
  form_04?: boolean;
  form_05?: boolean;
  form_06?: boolean;
  form_07?: boolean;
  form_07a?: boolean;
  form_08?: boolean;
  form_08a?: boolean;
  form_09?: boolean;
  form_09a?: boolean;
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
  internal_tracking_id?: string | null;
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

export type Inventor = InventorInfo;

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
  patent?: Patent;
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
  tracking_id?: string;
  fer_drafter_assgn?: string;
  fer_drafter_deadline?: string;
  fer_filer_assgn?: string;
  fer_filer_deadline?: string;
}
