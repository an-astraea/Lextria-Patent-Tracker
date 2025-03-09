
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";

// Employee functions
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
    
    return { 
      employees: data.map(emp => ({
        ...emp,
        role: emp.role as 'admin' | 'drafter' | 'filer' | 'employee'
      }))
    };
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
    
    return {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer' | 'employee'
    };
  } catch (error: any) {
    console.error("Exception fetching employee:", error);
    return { error: error.message, employee: null };
  }
};

export const createEmployee = async (employeeData: Partial<Employee>) => {
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
    
    return { 
      success: true, 
      employee: {
        ...data,
        role: data.role as 'admin' | 'drafter' | 'filer' | 'employee'
      }
    };
  } catch (error: any) {
    console.error("Exception creating employee:", error);
    return { error: error.message, success: false };
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
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
