export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          created_at: string | null
          email: string
          emp_id: string
          full_name: string
          id: string
          password: string
          ph_no: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          emp_id: string
          full_name: string
          id?: string
          password: string
          ph_no: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          emp_id?: string
          full_name?: string
          id?: string
          password?: string
          ph_no?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fer_entries: {
        Row: {
          created_at: string | null
          fer_completion_status: number | null
          fer_date: string | null
          fer_drafter_assgn: string | null
          fer_drafter_deadline: string | null
          fer_drafter_status: number | null
          fer_filer_assgn: string | null
          fer_filer_deadline: string | null
          fer_filing_status: number | null
          fer_number: number
          fer_review_draft_status: number | null
          fer_review_file_status: number | null
          id: string
          patent_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fer_completion_status?: number | null
          fer_date?: string | null
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_drafter_status?: number | null
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_filing_status?: number | null
          fer_number: number
          fer_review_draft_status?: number | null
          fer_review_file_status?: number | null
          id?: string
          patent_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fer_completion_status?: number | null
          fer_date?: string | null
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_drafter_status?: number | null
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_filing_status?: number | null
          fer_number?: number
          fer_review_draft_status?: number | null
          fer_review_file_status?: number | null
          id?: string
          patent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fer_entries_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      fer_history: {
        Row: {
          created_at: string | null
          fer_drafter_assgn: string | null
          fer_drafter_deadline: string | null
          fer_filer_assgn: string | null
          fer_filer_deadline: string | null
          id: string
          tracking_id: string
        }
        Insert: {
          created_at?: string | null
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          id?: string
          tracking_id: string
        }
        Update: {
          created_at?: string | null
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          id?: string
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fer_history_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["tracking_id"]
          },
        ]
      }
      inventors: {
        Row: {
          id: string
          inventor_addr: string
          inventor_name: string
          tracking_id: string
        }
        Insert: {
          id?: string
          inventor_addr: string
          inventor_name: string
          tracking_id: string
        }
        Update: {
          id?: string
          inventor_addr?: string
          inventor_name?: string
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventors_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["tracking_id"]
          },
        ]
      }
      patent_timeline: {
        Row: {
          created_at: string
          deadline_date: string | null
          employee_name: string | null
          event_description: string
          event_type: string
          id: string
          patent_id: string
          status: number | null
        }
        Insert: {
          created_at?: string
          deadline_date?: string | null
          employee_name?: string | null
          event_description: string
          event_type: string
          id?: string
          patent_id: string
          status?: number | null
        }
        Update: {
          created_at?: string
          deadline_date?: string | null
          employee_name?: string | null
          event_description?: string
          event_type?: string
          id?: string
          patent_id?: string
          status?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_timeline_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["id"]
          },
        ]
      }
      patents: {
        Row: {
          applicant_addr: string
          application_no: string | null
          client_id: string
          completed: boolean | null
          created_at: string | null
          cs_completion_status: number
          cs_confirmed: boolean | null
          cs_data: boolean | null
          cs_data_received: boolean | null
          cs_drafter_assgn: string | null
          cs_drafter_deadline: string | null
          cs_drafting_status: number
          cs_filer_assgn: string | null
          cs_filer_deadline: string | null
          cs_filing_status: number
          cs_review_draft_status: number
          cs_review_file_status: number
          date_of_filing: string | null
          fer_completion_status: number
          fer_drafter_assgn: string | null
          fer_drafter_deadline: string | null
          fer_drafter_status: number
          fer_filer_assgn: string | null
          fer_filer_deadline: string | null
          fer_filing_status: number
          fer_review_draft_status: number
          fer_review_file_status: number
          fer_status: number
          form_01: boolean | null
          form_02: boolean | null
          form_02_cs: boolean | null
          form_02_ps: boolean | null
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
          form_9: boolean | null
          form_9a: boolean | null
          id: string
          idf_received: boolean | null
          idf_sent: boolean | null
          inventor_email: string
          inventor_ph_no: string
          invoice_sent: boolean | null
          notes: string | null
          other_forms: string | null
          patent_applicant: string
          patent_title: string
          payment_amount: number | null
          payment_received: number | null
          payment_status: string | null
          pending_cs_confirmation: boolean | null
          pending_ps_confirmation: boolean | null
          ps_completion_status: number
          ps_confirmed: boolean | null
          ps_drafter_assgn: string | null
          ps_drafter_deadline: string | null
          ps_drafting_status: number
          ps_filer_assgn: string | null
          ps_filer_deadline: string | null
          ps_filing_status: number
          ps_review_draft_status: number
          ps_review_file_status: number
          tracking_id: string
          updated_at: string | null
          withdrawn: boolean | null
        }
        Insert: {
          applicant_addr: string
          application_no?: string | null
          client_id: string
          completed?: boolean | null
          created_at?: string | null
          cs_completion_status?: number
          cs_confirmed?: boolean | null
          cs_data?: boolean | null
          cs_data_received?: boolean | null
          cs_drafter_assgn?: string | null
          cs_drafter_deadline?: string | null
          cs_drafting_status?: number
          cs_filer_assgn?: string | null
          cs_filer_deadline?: string | null
          cs_filing_status?: number
          cs_review_draft_status?: number
          cs_review_file_status?: number
          date_of_filing?: string | null
          fer_completion_status?: number
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_drafter_status?: number
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_filing_status?: number
          fer_review_draft_status?: number
          fer_review_file_status?: number
          fer_status?: number
          form_01?: boolean | null
          form_02?: boolean | null
          form_02_cs?: boolean | null
          form_02_ps?: boolean | null
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
          form_9?: boolean | null
          form_9a?: boolean | null
          id?: string
          idf_received?: boolean | null
          idf_sent?: boolean | null
          inventor_email: string
          inventor_ph_no: string
          invoice_sent?: boolean | null
          notes?: string | null
          other_forms?: string | null
          patent_applicant: string
          patent_title: string
          payment_amount?: number | null
          payment_received?: number | null
          payment_status?: string | null
          pending_cs_confirmation?: boolean | null
          pending_ps_confirmation?: boolean | null
          ps_completion_status?: number
          ps_confirmed?: boolean | null
          ps_drafter_assgn?: string | null
          ps_drafter_deadline?: string | null
          ps_drafting_status?: number
          ps_filer_assgn?: string | null
          ps_filer_deadline?: string | null
          ps_filing_status?: number
          ps_review_draft_status?: number
          ps_review_file_status?: number
          tracking_id: string
          updated_at?: string | null
          withdrawn?: boolean | null
        }
        Update: {
          applicant_addr?: string
          application_no?: string | null
          client_id?: string
          completed?: boolean | null
          created_at?: string | null
          cs_completion_status?: number
          cs_confirmed?: boolean | null
          cs_data?: boolean | null
          cs_data_received?: boolean | null
          cs_drafter_assgn?: string | null
          cs_drafter_deadline?: string | null
          cs_drafting_status?: number
          cs_filer_assgn?: string | null
          cs_filer_deadline?: string | null
          cs_filing_status?: number
          cs_review_draft_status?: number
          cs_review_file_status?: number
          date_of_filing?: string | null
          fer_completion_status?: number
          fer_drafter_assgn?: string | null
          fer_drafter_deadline?: string | null
          fer_drafter_status?: number
          fer_filer_assgn?: string | null
          fer_filer_deadline?: string | null
          fer_filing_status?: number
          fer_review_draft_status?: number
          fer_review_file_status?: number
          fer_status?: number
          form_01?: boolean | null
          form_02?: boolean | null
          form_02_cs?: boolean | null
          form_02_ps?: boolean | null
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
          form_9?: boolean | null
          form_9a?: boolean | null
          id?: string
          idf_received?: boolean | null
          idf_sent?: boolean | null
          inventor_email?: string
          inventor_ph_no?: string
          invoice_sent?: boolean | null
          notes?: string | null
          other_forms?: string | null
          patent_applicant?: string
          patent_title?: string
          payment_amount?: number | null
          payment_received?: number | null
          payment_status?: string | null
          pending_cs_confirmation?: boolean | null
          pending_ps_confirmation?: boolean | null
          ps_completion_status?: number
          ps_confirmed?: boolean | null
          ps_drafter_assgn?: string | null
          ps_drafter_deadline?: string | null
          ps_drafting_status?: number
          ps_filer_assgn?: string | null
          ps_filer_deadline?: string | null
          ps_filing_status?: number
          ps_review_draft_status?: number
          ps_review_file_status?: number
          tracking_id?: string
          updated_at?: string | null
          withdrawn?: boolean | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
