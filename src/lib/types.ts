
import { Database } from "@/integrations/supabase/types";

// Type for Patent data from Supabase
export type Patent = Database["public"]["Tables"]["patents"]["Row"] & {
  inventors?: Inventor[];
  fer_history?: FERHistory[];
};

// Type for Inventor data from Supabase
export type Inventor = Database["public"]["Tables"]["inventors"]["Row"];

// Type for FER History data from Supabase
export type FERHistory = Database["public"]["Tables"]["fer_history"]["Row"];

// Type for Employee data from Supabase
export type Employee = {
  id: string;
  emp_id: string;
  full_name: string;
  email: string;
  ph_no: string;
  password: string;
  role: 'admin' | 'drafter' | 'filer';
  created_at: string | null;
  updated_at: string | null;
};

// Type for form data when creating/editing a patent
export type PatentFormData = {
  tracking_id: string;
  patent_applicant: string;
  client_id: string;
  application_no?: string | null;
  date_of_filing?: string | null; // Made optional to match database change
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
  inventors?: {
    inventor_name: string;
    inventor_addr: string;
  }[];
};

// Type for Timeline events
export type TimelineEvent = Database["public"]["Tables"]["patent_timeline"]["Row"];
