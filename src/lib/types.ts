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
  // Financial fields - new 4-component structure
  professional_fees?: number;       // Entered by admin
  gst_amount?: number;              // Auto-calculated (18% of professional fees)
  tds_amount?: number;              // Auto-calculated (10% of professional fees)
  reimbursement?: number;           // Entered by admin
  payment_amount?: number;          // Auto-calculated total amount
  payment_received?: number;        // Amount actually received
  payment_status?: string;          // 'not_sent', 'sent', 'received'
  invoice_sent?: boolean;           // Whether invoice has been sent
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
  notes?: string;
  idf_sent?: boolean;
  idf_received?: boolean;
  cs_data?: boolean;
  cs_data_received?: boolean;
  // New reminder and follow-up fields
  follow_up_count?: number;
  follow_up_status?: string; // Changed from union type to string to match database
  last_follow_up_date?: string | null;
  next_reminder_date?: string | null;
  stage_updated_at?: string;
  current_stage?: string;
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
  // Add financial fields to PatentFormData
  professional_fees?: number;
  gst_amount?: number;
  tds_amount?: number;
  reimbursement?: number;
  payment_amount?: number;
  payment_received?: number;
  payment_status?: string;
  invoice_sent?: boolean;
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

// Add Inventor alias for backward compatibility
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
  patent?: Patent; // Add this for when the patent is included in a FER response
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
  tracking_id?: string; // Add this for backward compatibility
  fer_drafter_assgn?: string; // Add this for backward compatibility
  fer_drafter_deadline?: string; // Add this for backward compatibility
  fer_filer_assgn?: string; // Add this for backward compatibility
  fer_filer_deadline?: string; // Add this for backward compatibility
}

export interface TimelineItem {
  id: string;
  patent_id: string;
  event_type: string;
  event_description: string;
  deadline_date?: string | null;
  employee_name?: string | null;
  status?: number;
  created_at: string;
}

export interface TimelineEventData {
  patent_id: string;
  event_type: string;
  event_description: string;
  deadline_date?: string | null;
  employee_name?: string;
}

// New interfaces for reminder system
export interface PatentReminder {
  id: string;
  patent_id: string;
  reminder_type: 'stage_stagnant' | 'follow_up_needed' | 'unresponsive';
  stage_name: string;
  days_stagnant: number;
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  notes?: string;
  patent?: Patent;
}

export interface StagnantPatent {
  patent: Patent;
  days_stagnant: number;
  current_stage: string;
  reminders: PatentReminder[];
}
