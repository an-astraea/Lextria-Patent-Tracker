
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
          ps_drafter_assgn: string | null
          ps_drafter_deadline: string | null
          ps_review_draft_status: number
          ps_filing_status: number
          ps_filer_assgn: string | null
          ps_filer_deadline: string | null
          ps_review_file_status: number
          ps_completion_status: number
          cs_drafting_status: number
          cs_drafter_assgn: string | null
          cs_drafter_deadline: string | null
          cs_review_draft_status: number
          cs_filing_status: number
          cs_filer_assgn: string | null
          cs_filer_deadline: string | null
          form_26: boolean | null
          form_18: boolean | null
          form_18a: boolean | null
          form_9: boolean | null
          form_9a: boolean | null
          form_13: boolean | null
          cs_review_file_status: number
          cs_completion_status: number
          fer_status: number
          fer_drafter_status: number
          fer_drafter_assgn: string | null
          fer_drafter_deadline: string | null
          fer_review_draft_status: number
          fer_filing_status: number
          fer_filer_assgn: string | null
          fer_filer_deadline: string | null
          fer_review_file_status: number
          fer_completion_status: number
          created_at: string
          updated_at: string
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
          ps_drafter_assgn?: string | null
          ps_drafter_deadline?: string | null
          ps_review_draft_status?: number
          ps_filing_status?: number
          ps_filer_assgn?: string | null
          ps_filer_deadline?: string | null
          ps_review_file_status?: number
          ps_completion_status?: number
          cs_drafting_status?: number
          cs_drafter_assgn?: string | null
          cs_drafter_deadline?: string | null
          cs_review_draft_status?: number
          cs_filing_status?: number
          cs_filer_assgn?: string | null
          cs_filer_deadline?: string | null
          form_26?: boolean | null
          form_18?: boolean | null
          form_18a?: boolean | null
          form_9?: boolean | null
          form_9a?: boolean | null
          form_13?: boolean | null
          cs_review_file_status?: number
          cs_completion_status?: number
          fer_status?: number
          fer_drafter_status?: number
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_review_draft_status?: number
          fer_filing_status?: number
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_review_file_status?: number
          fer_completion_status?: number
          created_at?: string
          updated_at?: string
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
          ps_drafter_assgn?: string | null
          ps_drafter_deadline?: string | null
          ps_review_draft_status?: number
          ps_filing_status?: number
          ps_filer_assgn?: string | null
          ps_filer_deadline?: string | null
          ps_review_file_status?: number
          ps_completion_status?: number
          cs_drafting_status?: number
          cs_drafter_assgn?: string | null
          cs_drafter_deadline?: string | null
          cs_review_draft_status?: number
          cs_filing_status?: number
          cs_filer_assgn?: string | null
          cs_filer_deadline?: string | null
          form_26?: boolean | null
          form_18?: boolean | null
          form_18a?: boolean | null
          form_9?: boolean | null
          form_9a?: boolean | null
          form_13?: boolean | null
          cs_review_file_status?: number
          cs_completion_status?: number
          fer_status?: number
          fer_drafter_status?: number
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_review_draft_status?: number
          fer_filing_status?: number
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_review_file_status?: number
          fer_completion_status?: number
          created_at?: string
          updated_at?: string
        }
      }
      inventors: {
        Row: {
          id: string
          tracking_id: string
          inventor_name: string
          inventor_addr: string
        }
        Insert: {
          id?: string
          tracking_id: string
          inventor_name: string
          inventor_addr: string
        }
        Update: {
          id?: string
          tracking_id?: string
          inventor_name?: string
          inventor_addr?: string
        }
      }
      fer_history: {
        Row: {
          id: string
          tracking_id: string
          fer_drafter_assgn: string | null
          fer_drafter_deadline: string | null
          fer_filer_assgn: string | null
          fer_filer_deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tracking_id: string
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tracking_id?: string
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          emp_id: string
          full_name: string
          email: string
          ph_no: string
          password: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          emp_id: string
          full_name: string
          email: string
          ph_no: string
          password: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          emp_id?: string
          full_name?: string
          email?: string
          ph_no?: string
          password?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
