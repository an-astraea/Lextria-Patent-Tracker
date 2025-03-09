
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
  created_at: string;
}

export interface FEREntry {
  id: string;
  patent_id: string;
  fer_number: number;
  fer_date?: string;
  fer_drafter_assgn?: string;
  fer_drafter_deadline?: string;
  fer_drafter_status: number;
  fer_filer_assgn?: string;
  fer_filer_deadline?: string;
  fer_filing_status: number;
  fer_review_draft_status: number;
  fer_review_file_status: number;
  fer_completion_status: number;
  created_at: string;
  updated_at: string;
  patent?: Patent;
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
  form_01?: boolean | null;
  form_02_ps?: boolean | null;
  form_02_cs?: boolean | null;
  form_03?: boolean | null;
  form_04?: boolean | null;
  form_05?: boolean | null;
  form_06?: boolean | null;
  form_07?: boolean | null;
  form_07a?: boolean | null;
  form_08?: boolean | null;
  form_08a?: boolean | null;
  form_09?: boolean | null;
  form_09a?: boolean | null;
  form_10?: boolean | null;
  form_11?: boolean | null;
  form_12?: boolean | null;
  form_13?: boolean | null;
  form_14?: boolean | null;
  form_15?: boolean | null;
  form_16?: boolean | null;
  form_17?: boolean | null;
  form_18?: boolean | null;
  form_18a?: boolean | null;
  form_19?: boolean | null;
  form_20?: boolean | null;
  form_21?: boolean | null;
  form_22?: boolean | null;
  form_23?: boolean | null;
  form_24?: boolean | null;
  form_25?: boolean | null;
  form_26?: boolean | null;
  form_27?: boolean | null;
  form_28?: boolean | null;
  form_29?: boolean | null;
  form_30?: boolean | null;
  form_31?: boolean | null;
  other_forms?: string | null;
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
  fer_entries?: FEREntry[];
  notes?: string;
  withdrawn?: boolean;
  idf_sent?: boolean;
  idf_received?: boolean;
  cs_data?: boolean;
  cs_data_received?: boolean;
  completed?: boolean;
  invoice_sent?: boolean;
  payment_status?: string;
  payment_amount?: number;
  payment_received?: number;
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
  role: 'admin' | 'drafter' | 'filer' | 'employee';
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
  role: 'admin' | 'drafter' | 'filer' | 'employee';
}

export interface User {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'drafter' | 'filer' | 'employee';
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

export enum ApprovalStatus {
  Pending = 0,
  Submitted = 1,
  Approved = 2,
  Rejected = 3
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
  NotStarted = 0,
  InProgress = 1,
  UnderReview = 2,
  Completed = 3
}

export interface PatentFilters {
  status?: string;
  drafter?: string;
  filer?: string;
  searchTerm?: string;
}

export interface PatentCardProps {
  patent: Patent;
  key?: string;
  isCompact?: boolean;
  showClientInfo?: boolean;
  showReviewBadge?: boolean;
}

export interface PaymentStatusSectionProps {
  patent: Patent;
  onUpdate?: () => void;
  isAdmin?: boolean;
  userRole?: string;
  refreshPatentData?: () => Promise<void>;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => Promise<void> | void;
  icon?: string;
}

export interface LoadingStateProps {
  message?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
  patent?: T;
  patents?: T[];
  employees?: Employee[];
  timeline?: any[];
  fer?: any;
}

// Helper type for API responses
export type ApiPatentsResponse = Patent[] | { patents: Patent[]; error?: any } | { error: any; patents: any[] };
export type ApiEmployeesResponse = Employee[] | { employees: Employee[]; error?: any } | { error: any; employees: any[] };
export type ApiPatentResponse = Patent | { patent: Patent; error?: any } | { error: any; patent: any };
export type ApiTimelineResponse = TimelineEvent[] | { timeline: TimelineEvent[]; error?: any } | { error: any; timeline: any[] };
export type ApiFERResponse = FEREntry | { fer: FEREntry; error?: any } | { error: any; fer: any; success: boolean };

export type PatentResponse = Patent | { error: any; patent: any; } | { 
  patent: Patent; 
  error?: any; 
  success?: boolean;
};

export type FEREntryResponse = FEREntry | { 
  error: any; 
  success: boolean; 
  fer?: FEREntry;
};

export type EmployeeResponse = Employee | { 
  error: any; 
  employee: any; 
  success?: boolean;
};

export function formatDateForDatabase(dateString: string | null): string | null {
  if (!dateString) return null;
  
  if (dateString.includes('T')) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export interface CreateInventorResponse {
  success: boolean;
  inventor?: Inventor;
  error?: string;
}

// Helper function to handle API response for Patents
export function handlePatentsResponse(response: ApiPatentsResponse): Patent[] {
  if (Array.isArray(response)) {
    return response;
  } else if (response && 'patents' in response && Array.isArray(response.patents)) {
    return response.patents;
  }
  return [];
}

// Helper function to handle API response for Employees
export function handleEmployeesResponse(response: ApiEmployeesResponse): Employee[] {
  if (Array.isArray(response)) {
    return response;
  } else if (response && 'employees' in response && Array.isArray(response.employees)) {
    return response.employees;
  }
  return [];
}

// Helper function to handle API response for a single Patent
export function handlePatentResponse(response: ApiPatentResponse): Patent | null {
  if (!response) return null;
  
  if ('id' in response) {
    return response as Patent;
  } else if ('patent' in response && response.patent) {
    return response.patent as Patent;
  }
  return null;
}

// Helper function to handle API response for Timeline
export function handleTimelineResponse(response: ApiTimelineResponse): TimelineEvent[] {
  if (Array.isArray(response)) {
    return response;
  } else if (response && 'timeline' in response && Array.isArray(response.timeline)) {
    return response.timeline;
  }
  return [];
}

// Helper function to handle API response for FER Entry
export function handleFERResponse(response: ApiFERResponse): FEREntry | null {
  if (!response) return null;
  
  if ('id' in response && 'fer_number' in response) {
    return response as FEREntry;
  } else if ('fer' in response && response.fer) {
    return response.fer as FEREntry;
  }
  return null;
}

// Helper function to create dummy ID for inventors
export function createDummyInventorId(): string {
  return `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
