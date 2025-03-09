export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          role: string
          password: string
          ph_no: string
          email: string
          full_name: string
          emp_id: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          role: string
          password: string
          ph_no: string
          email: string
          full_name: string
          emp_id: string
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          role?: string
          password?: string
          ph_no?: string
          email?: string
          full_name?: string
          emp_id?: string
        }
      }
      patents: {
        Row: {
          id: string
          tracking_id: string
          patent_applicant: string
          client_id: string
          application_no: string | null
          date_of_filing: string
          patent_title: string
          applicant_addr: string
          inventor_ph_no: string
          inventor_email: string
          ps_drafting_status: number
          ps_drafter_assgn: string
          ps_drafter_deadline: string
          ps_review_draft_status: number
          ps_filing_status: number
          ps_filer_assgn: string
          ps_filer_deadline: string
          ps_review_file_status: number
          ps_completion_status: number
          cs_drafting_status: number
          cs_drafter_assgn: string
          cs_drafter_deadline: string
          cs_review_draft_status: number
          cs_filing_status: number
          cs_filer_assgn: string
          cs_filer_deadline: string
          cs_review_file_status: number
          cs_completion_status: number
          fer_status: number
          fer_drafter_status: number
          fer_drafter_assgn: string
          fer_drafter_deadline: string
          fer_review_draft_status: number
          fer_filing_status: number
          fer_filer_assgn: string
          fer_filer_deadline: string
          fer_review_file_status: number
          fer_completion_status: number
          created_at: string
          updated_at: string
          notes: string | null
          form_01: boolean | null
          form_02_ps: boolean | null
          form_02_cs: boolean | null
          form_03: boolean | null
          form_04: boolean | null
          form_05: boolean | null
          form_06: boolean | null
          form_07: boolean | null
          form_07a: boolean | null
          form_08: boolean | null
          form_08a: boolean | null
          form_09: boolean | null
          form_09a: boolean | null
          form_10: boolean | null
          form_11: boolean | null
          form_12: boolean | null
          form_13: boolean | null
          form_14: boolean | null
          form_15: boolean | null
          form_16: boolean | null
          form_17: boolean | null
          form_18: boolean | null
          form_18a: boolean | null
          form_19: boolean | null
          form_20: boolean | null
          form_21: boolean | null
          form_22: boolean | null
          form_23: boolean | null
          form_24: boolean | null
          form_25: boolean | null
          form_26: boolean | null
          form_27: boolean | null
          form_28: boolean | null
          form_29: boolean | null
          form_30: boolean | null
          form_31: boolean | null
          other_forms: string | null
        }
        Insert: {
          id?: string
          tracking_id: string
          patent_applicant: string
          client_id: string
          application_no?: string | null
          date_of_filing: string
          patent_title: string
          applicant_addr: string
          inventor_ph_no: string
          inventor_email: string
          ps_drafting_status?: number
          ps_drafter_assgn: string
          ps_drafter_deadline: string
          ps_review_draft_status?: number
          ps_filing_status?: number
          ps_filer_assgn: string
          ps_filer_deadline: string
          ps_review_file_status?: number
          ps_completion_status?: number
          cs_drafting_status?: number
          cs_drafter_assgn: string
          cs_drafter_deadline: string
          cs_review_draft_status?: number
          cs_filing_status?: number
          cs_filer_assgn: string
          cs_filer_deadline: string
          cs_review_file_status?: number
          cs_completion_status?: number
          fer_status?: number
          fer_drafter_status?: number
          fer_drafter_assgn: string
          fer_drafter_deadline: string
          fer_review_draft_status?: number
          fer_filing_status?: number
          fer_filer_assgn: string
          fer_filer_deadline: string
          fer_review_file_status?: number
          fer_completion_status?: number
          created_at?: string
          updated_at?: string
          notes?: string | null
          form_01?: boolean | null
          form_02_ps?: boolean | null
          form_02_cs?: boolean | null
          form_03?: boolean | null
          form_04?: boolean | null
          form_05?: boolean | null
          form_06?: boolean | null
          form_07?: boolean | null
          form_07a?: boolean | null
          form_08?: boolean | null
          form_08a?: boolean | null
          form_09?: boolean | null
          form_09a?: boolean | null
          form_10?: boolean | null
          form_11?: boolean | null
          form_12?: boolean | null
          form_13?: boolean | null
          form_14?: boolean | null
          form_15?: boolean | null
          form_16?: boolean | null
          form_17?: boolean | null
          form_18?: boolean | null
          form_18a?: boolean | null
          form_19?: boolean | null
          form_20?: boolean | null
          form_21?: boolean | null
          form_22?: boolean | null
          form_23?: boolean | null
          form_24?: boolean | null
          form_25?: boolean | null
          form_26?: boolean | null
          form_27?: boolean | null
          form_28?: boolean | null
          form_29?: boolean | null
          form_30?: boolean | null
          form_31?: boolean | null
          other_forms?: string | null
        }
        Update: {
          id?: string
          tracking_id?: string
          patent_applicant?: string
          client_id?: string
          application_no?: string | null
          date_of_filing?: string
          patent_title?: string
          applicant_addr?: string
          inventor_ph_no?: string
          inventor_email?: string
          ps_drafting_status?: number
          ps_drafter_assgn?: string
          ps_drafter_deadline?: string
          ps_review_draft_status?: number
          ps_filing_status?: number
          ps_filer_assgn?: string
          ps_filer_deadline?: string
          ps_review_file_status?: number
          ps_completion_status?: number
          cs_drafting_status?: number
          cs_drafter_assgn?: string
          cs_drafter_deadline?: string
          cs_review_draft_status?: number
          cs_filing_status?: number
          cs_filer_assgn?: string
          cs_filer_deadline?: string
          cs_review_file_status?: number
          cs_completion_status?: number
          fer_status?: number
          fer_drafter_status?: number
          fer_drafter_assgn?: string
          fer_drafter_deadline?: string
          fer_review_draft_status?: number
          fer_filing_status?: number
          fer_filer_assgn?: string
          fer_filer_deadline?: string
          fer_review_file_status?: number
          fer_completion_status?: number
          created_at?: string
          updated_at?: string
          notes?: string | null
          form_01?: boolean | null
          form_02_ps?: boolean | null
          form_02_cs?: boolean | null
          form_03?: boolean | null
          form_04?: boolean | null
          form_05?: boolean | null
          form_06?: boolean | null
          form_07?: boolean | null
          form_07a?: boolean | null
          form_08?: boolean | null
          form_08a?: boolean | null
          form_09?: boolean | null
          form_09a?: boolean | null
          form_10?: boolean | null
          form_11?: boolean | null
          form_12?: boolean | null
          form_13?: boolean | null
          form_14?: boolean | null
          form_15?: boolean | null
          form_16?: boolean | null
          form_17?: boolean | null
          form_18?: boolean | null
          form_18a?: boolean | null
          form_19?: boolean | null
          form_20?: boolean | null
          form_21?: boolean | null
          form_22?: boolean | null
          form_23?: boolean | null
          form_24?: boolean | null
          form_25?: boolean | null
          form_26?: boolean | null
          form_27?: boolean | null
          form_28?: boolean | null
          form_29?: boolean | null
          form_30?: boolean | null
          form_31?: boolean | null
          other_forms?: string | null
        }
      }
      inventors: {
        Row: {
          id: string
          tracking_id: string
          inventor_name: string
          inventor_addr: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tracking_id: string
          inventor_name: string
          inventor_addr: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tracking_id?: string
          inventor_name?: string
          inventor_addr?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      fer_entries: {
        Row: {
          id: string
          patent_id: string
          fer_number: number
          fer_date: string | null
          fer_drafter_assgn: string | null
          fer_drafter_deadline: string | null
          fer_drafter_status: number
          fer_filer_assgn: string | null
          fer_filer_deadline: string | null
          fer_filing_status: number
          fer_review_draft_status: number
          fer_review_file_status: number
          fer_completion_status: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patent_id: string
          fer_number: number
          fer_date?: string | null
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_drafter_status?: number
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_filing_status?: number
          fer_review_draft_status?: number
          fer_review_file_status?: number
          fer_completion_status?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patent_id?: string
          fer_number?: number
          fer_date?: string | null
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_drafter_status?: number
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_filing_status?: number
          fer_review_draft_status?: number
          fer_review_file_status?: number
          fer_completion_status?: number
          created_at?: string
          updated_at?: string
        }
      }
      fer_history: {
        Row: {
          id: string
          tracking_id: string
          fer_drafter_assgn: string
          fer_drafter_deadline: string
          fer_filer_assgn: string
          fer_filer_deadline: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tracking_id: string
          fer_drafter_assgn: string
          fer_drafter_deadline: string
          fer_filer_assgn: string
          fer_filer_deadline: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tracking_id?: string
          fer_drafter_assgn?: string
          fer_drafter_deadline?: string
          fer_filer_assgn?: string
          fer_filer_deadline?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      patient_timeline: {
        Row: {
          id: string
          patent_id: string
          event_type: string
          event_description: string
          created_at: string
          status: number
          employee_name: string | null
          deadline_date: string | null
        }
        Insert: {
          id?: string
          patent_id: string
          event_type: string
          event_description: string
          created_at?: string
          status: number
          employee_name?: string | null
          deadline_date?: string | null
        }
        Update: {
          id?: string
          patent_id?: string
          event_type?: string
          event_description?: string
          created_at?: string
          status?: number
          employee_name?: string | null
          deadline_date?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
