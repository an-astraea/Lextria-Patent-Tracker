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
      patent_reminders: {
        Row: {
          created_at: string
          days_stagnant: number
          id: string
          notes: string | null
          patent_id: string
          reminder_type: string
          resolved_at: string | null
          resolved_by: string | null
          stage_name: string
        }
        Insert: {
          created_at?: string
          days_stagnant: number
          id?: string
          notes?: string | null
          patent_id: string
          reminder_type: string
          resolved_at?: string | null
          resolved_by?: string | null
          stage_name: string
        }
        Update: {
          created_at?: string
          days_stagnant?: number
          id?: string
          notes?: string | null
          patent_id?: string
          reminder_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          stage_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "patent_reminders_patent_id_fkey"
            columns: ["patent_id"]
            isOneToOne: false
            referencedRelation: "patents"
            referencedColumns: ["id"]
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
          current_stage: string | null
          date_of_filing: string | null
          date_of_receipt: string | null
          expected_amount: number | null
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
          follow_up_count: number | null
          follow_up_status: string | null
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
          gst_amount: number | null
          id: string
          idf_received: boolean | null
          idf_sent: boolean | null
          internal_tracking_id: string | null
          inventor_email: string
          inventor_ph_no: string
          invoice_sent: boolean | null
          invoice_status: string | null
          last_follow_up_date: string | null
          next_reminder_date: string | null
          notes: string | null
          other_forms: string | null
          patent_applicant: string
          patent_title: string
          payment_amount: number | null
          payment_received: number | null
          payment_status: string | null
          pending_cs_confirmation: boolean | null
          pending_ps_confirmation: boolean | null
          professional_fees: number | null
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
          reimbursement: number | null
          stage_updated_at: string | null
          tds_amount: number | null
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
          current_stage?: string | null
          date_of_filing?: string | null
          date_of_receipt?: string | null
          expected_amount?: number | null
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
          follow_up_count?: number | null
          follow_up_status?: string | null
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
          gst_amount?: number | null
          id?: string
          idf_received?: boolean | null
          idf_sent?: boolean | null
          internal_tracking_id?: string | null
          inventor_email: string
          inventor_ph_no: string
          invoice_sent?: boolean | null
          invoice_status?: string | null
          last_follow_up_date?: string | null
          next_reminder_date?: string | null
          notes?: string | null
          other_forms?: string | null
          patent_applicant: string
          patent_title: string
          payment_amount?: number | null
          payment_received?: number | null
          payment_status?: string | null
          pending_cs_confirmation?: boolean | null
          pending_ps_confirmation?: boolean | null
          professional_fees?: number | null
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
          reimbursement?: number | null
          stage_updated_at?: string | null
          tds_amount?: number | null
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
          current_stage?: string | null
          date_of_filing?: string | null
          date_of_receipt?: string | null
          expected_amount?: number | null
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
          follow_up_count?: number | null
          follow_up_status?: string | null
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
          gst_amount?: number | null
          id?: string
          idf_received?: boolean | null
          idf_sent?: boolean | null
          internal_tracking_id?: string | null
          inventor_email?: string
          inventor_ph_no?: string
          invoice_sent?: boolean | null
          invoice_status?: string | null
          last_follow_up_date?: string | null
          next_reminder_date?: string | null
          notes?: string | null
          other_forms?: string | null
          patent_applicant?: string
          patent_title?: string
          payment_amount?: number | null
          payment_received?: number | null
          payment_status?: string | null
          pending_cs_confirmation?: boolean | null
          pending_ps_confirmation?: boolean | null
          professional_fees?: number | null
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
          reimbursement?: number | null
          stage_updated_at?: string | null
          tds_amount?: number | null
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
      check_stagnant_patents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
