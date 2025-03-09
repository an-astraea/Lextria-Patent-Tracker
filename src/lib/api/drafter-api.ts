
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "../types";

export const fetchEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (error) {
      console.error("Error fetching employees:", error);
      return { error: error.message, employees: [] };
    }
    
    return { employees: data };
  } catch (error: any) {
    console.error("Exception fetching employees:", error);
    return { error: error.message, employees: [] };
  }
};

export const fetchEmployeeById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching employee:", error);
      return { error: error.message, employee: null };
    }
    
    return data;
  } catch (error: any) {
    console.error("Exception fetching employee:", error);
    return { error: error.message, employee: null };
  }
};

export const createEmployee = async (employeeData: any) => {
  try {
    // Create the employee record
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        emp_id: employeeData.emp_id,
        full_name: employeeData.full_name,
        email: employeeData.email,
        ph_no: employeeData.ph_no,
        password: employeeData.password,
        role: employeeData.role || 'drafter' // Default to drafter if role not specified
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating employee:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true, employee: data };
  } catch (error: any) {
    console.error("Exception creating employee:", error);
    return { error: error.message, success: false };
  }
};

export const updateEmployee = async (id: string, employeeData: any) => {
  try {
    // Update employee record
    const { error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating employee:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating employee:", error);
    return { error: error.message, success: false };
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    // Delete the employee record
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error("Error deleting employee:", deleteError);
      return { error: deleteError.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception deleting employee:", error);
    return { error: error.message, success: false };
  }
};

export const fetchDrafterAssignments = async (drafterId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_drafter_assgn.eq.${drafterId},cs_drafter_assgn.eq.${drafterId}`)
      .or('ps_drafting_status.eq.0,cs_drafting_status.eq.0')
      .eq('ps_review_draft_status', 0)
      .eq('cs_review_draft_status', 0);
    
    if (error) {
      console.error("Error fetching drafter assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching drafter assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchDrafterCompletedAssignments = async (drafterId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_drafter_assgn.eq.${drafterId},cs_drafter_assgn.eq.${drafterId}`)
      .or('ps_drafting_status.eq.1,cs_drafting_status.eq.1');
    
    if (error) {
      console.error("Error fetching completed drafter assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching completed drafter assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchDrafterFERAssignments = async (drafterId: string) => {
  try {
    // First get patents with fer_status = 1
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .eq('fer_status', 1);
    
    if (error) {
      console.error("Error fetching FER assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    // Filter to only include patents with FER entries assigned to this drafter
    const filteredPatents = data.filter(patent => 
      patent.fer_entries && 
      patent.fer_entries.some((entry: any) => 
        entry.fer_drafter_assgn === drafterId && 
        entry.fer_drafter_status === 0
      )
    );
    
    return { patents: filteredPatents };
  } catch (error: any) {
    console.error("Exception fetching FER assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const completeDrafterTask = async (patentId: string, taskType: 'ps' | 'cs') => {
  try {
    const updateData = taskType === 'ps' 
      ? { 
          ps_drafting_status: 1,
          ps_review_draft_status: 1
        } 
      : { 
          cs_drafting_status: 1,
          cs_review_draft_status: 1
        };
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patentId);
    
    if (error) {
      console.error("Error completing drafter task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing drafter task:", error);
    return { error: error.message, success: false };
  }
};

export const completeFERDrafterTask = async (ferEntry: FEREntry, drafterName: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_drafter_status: 1,
        fer_review_draft_status: 1
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error("Error completing FER drafter task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing FER drafter task:", error);
    return { error: error.message, success: false };
  }
};
