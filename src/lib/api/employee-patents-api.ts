
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { normalizePatents } from "../utils/type-converters";

export const fetchEmployeeWithPatentCounts = async (id: string): Promise<Employee & { patentCounts?: any } | null> => {
  try {
    // First get the employee details
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (employeeError) {
      throw employeeError;
    }

    if (!employee) {
      return null;
    }

    // Get all patents assigned to this employee
    const { data: patents, error: patentsError } = await supabase
      .from("patents")
      .select("*")
      .or(`ps_drafter_assgn.eq.${employee.full_name},ps_filer_assgn.eq.${employee.full_name},cs_drafter_assgn.eq.${employee.full_name},cs_filer_assgn.eq.${employee.full_name},fer_drafter_assgn.eq.${employee.full_name},fer_filer_assgn.eq.${employee.full_name}`);

    if (patentsError) {
      throw patentsError;
    }

    // Count patents by status
    const total = patents ? patents.length : 0;
    
    // Patents where the employee is assigned drafting tasks
    const drafting = patents ? patents.filter(patent => 
      (patent.ps_drafter_assgn === employee.full_name && patent.ps_drafting_status === 0) ||
      (patent.cs_drafter_assgn === employee.full_name && patent.cs_drafting_status === 0) ||
      (patent.fer_drafter_assgn === employee.full_name && patent.fer_drafter_status === 0)
    ).length : 0;

    // Patents where the employee is assigned filing tasks
    const filing = patents ? patents.filter(patent => 
      (patent.ps_filer_assgn === employee.full_name && patent.ps_filing_status === 0) ||
      (patent.cs_filer_assgn === employee.full_name && patent.cs_filing_status === 0) ||
      (patent.fer_filer_assgn === employee.full_name && patent.fer_filing_status === 0)
    ).length : 0;

    // Patents where the employee has completed all assigned tasks
    const completed = patents ? patents.filter(patent => {
      const psDrafterComplete = patent.ps_drafter_assgn !== employee.full_name || patent.ps_drafting_status === 1;
      const psFilerComplete = patent.ps_filer_assgn !== employee.full_name || patent.ps_filing_status === 1;
      const csDrafterComplete = patent.cs_drafter_assgn !== employee.full_name || patent.cs_drafting_status === 1;
      const csFilerComplete = patent.cs_filer_assgn !== employee.full_name || patent.cs_filing_status === 1;
      const ferDrafterComplete = patent.fer_drafter_assgn !== employee.full_name || patent.fer_drafter_status === 1;
      const ferFilerComplete = patent.fer_filer_assgn !== employee.full_name || patent.fer_filing_status === 1;
      
      // All tasks assigned to this employee are complete
      return psDrafterComplete && psFilerComplete && csDrafterComplete && csFilerComplete && ferDrafterComplete && ferFilerComplete;
    }).length : 0;

    return {
      ...employee,
      patentCounts: {
        total,
        drafting,
        filing,
        completed
      }
    };
  } catch (error) {
    console.error("Error fetching employee with patent counts:", error);
    return null;
  }
};

export const fetchEmployeePatents = async (employeeName: string) => {
  try {
    // Get all patents where this employee is assigned
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .or(`ps_drafter_assgn.eq.${employeeName},ps_filer_assgn.eq.${employeeName},cs_drafter_assgn.eq.${employeeName},cs_filer_assgn.eq.${employeeName},fer_drafter_assgn.eq.${employeeName},fer_filer_assgn.eq.${employeeName}`);

    if (error) {
      throw error;
    }

    return normalizePatents(data || []);
  } catch (error) {
    console.error("Error fetching employee patents:", error);
    return [];
  }
};
