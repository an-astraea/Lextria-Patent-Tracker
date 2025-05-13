
import { supabase } from "@/integrations/supabase/client";
import { Patent } from "@/lib/types";
import { toast } from "sonner";

// Fetch patents assigned to a specific employee
export const fetchEmployeePatents = async (employeeFullName: string): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select("*")
      .or(`ps_drafter_assgn.eq.${employeeFullName},ps_filer_assgn.eq.${employeeFullName},cs_drafter_assgn.eq.${employeeFullName},cs_filer_assgn.eq.${employeeFullName},fer_drafter_assgn.eq.${employeeFullName},fer_filer_assgn.eq.${employeeFullName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching employee patents:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchEmployeePatents:", error);
    toast.error("Failed to load employee patents");
    return [];
  }
};

// Fetch detailed employee information including patent counts
export const fetchEmployeeWithPatentCounts = async (employeeId: string) => {
  try {
    // First, get the employee details
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (employeeError) throw employeeError;
    
    if (!employee) {
      return null;
    }
    
    // Then, fetch patents assigned to this employee
    const { data: patents, error: patentsError } = await supabase
      .from("patents")
      .select("*")
      .or(`ps_drafter_assgn.eq.${employee.full_name},ps_filer_assgn.eq.${employee.full_name},cs_drafter_assgn.eq.${employee.full_name},cs_filer_assgn.eq.${employee.full_name},fer_drafter_assgn.eq.${employee.full_name},fer_filer_assgn.eq.${employee.full_name}`);
    
    if (patentsError) throw patentsError;
    
    // Calculate patent counts
    const counts = {
      total: patents?.length || 0,
      drafting: patents?.filter(p => 
        (p.ps_drafter_assgn === employee.full_name && p.ps_drafting_status === 0) ||
        (p.cs_drafter_assgn === employee.full_name && p.cs_drafting_status === 0) ||
        (p.fer_drafter_assgn === employee.full_name && p.fer_drafter_status === 0)
      ).length || 0,
      filing: patents?.filter(p => 
        (p.ps_filer_assgn === employee.full_name && p.ps_filing_status === 0) || 
        (p.cs_filer_assgn === employee.full_name && p.cs_filing_status === 0) ||
        (p.fer_filer_assgn === employee.full_name && p.fer_filing_status === 0)
      ).length || 0,
      completed: patents?.filter(p => 
        (p.ps_drafter_assgn === employee.full_name && p.ps_drafting_status === 1) ||
        (p.ps_filer_assgn === employee.full_name && p.ps_filing_status === 1) ||
        (p.cs_drafter_assgn === employee.full_name && p.cs_drafting_status === 1) ||
        (p.cs_filer_assgn === employee.full_name && p.cs_filing_status === 1) ||
        (p.fer_drafter_assgn === employee.full_name && p.fer_drafter_status === 1) ||
        (p.fer_filer_assgn === employee.full_name && p.fer_filing_status === 1)
      ).length || 0
    };
    
    return {
      ...employee,
      patentCounts: counts,
    };
  } catch (error) {
    console.error("Error fetching employee with patent counts:", error);
    toast.error("Failed to load employee details");
    return null;
  }
};
