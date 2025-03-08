
export interface Inventor {
  id: string;
  tracking_id: string;
  inventor_name: string;
  inventor_addr: string;
}

export interface FERHistory {
  id: string;
  tracking_id: string;
  fer_drafter_assgn: string;
  fer_drafter_deadline: string;
  fer_filer_assgn: string;
  fer_filer_deadline: string;
}

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
  ps_drafter_assgn: string;
  ps_drafter_deadline: string;
  ps_review_draft_status: number;
  ps_filing_status: number;
  ps_filer_assgn: string;
  ps_filer_deadline: string;
  ps_review_file_status: number;
  ps_completion_status: number;
  cs_drafting_status: number;
  cs_drafter_assgn: string;
  cs_drafter_deadline: string;
  cs_review_draft_status: number;
  cs_filing_status: number;
  cs_filer_assgn: string;
  cs_filer_deadline: string;
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
  form_10: boolean | null;
  form_11: boolean | null;
  form_12: boolean | null;
  form_13: boolean | null;
  form_14: boolean | null;
  form_15: boolean | null;
  form_16: boolean | null;
  form_17: boolean | null;
  form_18: boolean | null;
  form_18a: boolean | null;
  form_19: boolean | null;
  form_20: boolean | null;
  form_21: boolean | null;
  form_22: boolean | null;
  form_23: boolean | null;
  form_24: boolean | null;
  form_25: boolean | null;
  form_26: boolean | null;
  form_27: boolean | null;
  form_28: boolean | null;
  form_29: boolean | null;
  form_30: boolean | null;
  form_31: boolean | null;
  other_forms: string | null;
  cs_review_file_status: number;
  cs_completion_status: number;
  fer_status: number;
  fer_drafter_status: number;
  fer_drafter_assgn: string;
  fer_drafter_deadline: string;
  fer_review_draft_status: number;
  fer_filing_status: number;
  fer_filer_assgn: string;
  fer_filer_deadline: string;
  fer_review_file_status: number;
  fer_completion_status: number;
  created_at: string;
  updated_at: string;
  inventors?: Inventor[];
  fer_history?: FERHistory[];
  notes?: string;
}

export interface Employee {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password: string;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'drafter' | 'filer';
}

export interface PatentFormData {
  tracking_id: string;
  patent_applicant: string;
  client_id: string;
  application_no: string;
  date_of_filing: string;
  patent_title: string;
  applicant_addr: string;
  inventor_ph_no: string;
  inventor_email: string;
  ps_drafter_assgn: string;
  ps_drafter_deadline: string;
  ps_filer_assgn: string;
  ps_filer_deadline: string;
  cs_drafter_assgn: string;
  cs_drafter_deadline: string;
  cs_filer_assgn: string;
  cs_filer_deadline: string;
  fer_status: number;
  fer_drafter_assgn: string;
  fer_drafter_deadline: string;
  fer_filer_assgn: string;
  fer_filer_deadline: string;
  inventors: { inventor_name: string; inventor_addr: string }[];
}

export interface EmployeeFormData {
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password: string;
  role: 'admin' | 'drafter' | 'filer';
}

export interface User {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'drafter' | 'filer';
}

export interface PatientTimeline {
  id: string;
  patent_id: string;
  event_type: string;
  event_description: string;
  created_at: string;
  status: number;
  employee_name?: string;
  deadline_date?: string;
}

// Enhanced enum types to better represent the workflow states
export enum ApprovalStatus {
  Pending = 0,      // Not yet reviewed
  Submitted = 1,    // Submitted for review
  Approved = 2,     // Approved by admin
  Rejected = 3      // Rejected by admin (not used currently)
}

export enum WorkflowStage {
  PS_Drafting = 'ps_draft',
  PS_Filing = 'ps_file',
  CS_Drafting = 'cs_draft',
  CS_Filing = 'cs_file',
  FER_Drafting = 'fer_draft',
  FER_Filing = 'fer_file'
}

export enum WorkflowStatus {
  NotStarted = 0,   // Task not yet started
  InProgress = 1,   // Task in progress
  UnderReview = 2,  // Task submitted for review
  Completed = 3     // Task approved and completed
}
