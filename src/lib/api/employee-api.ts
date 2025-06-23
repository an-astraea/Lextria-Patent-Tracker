
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { toast } from "sonner";

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*");

    if (error) {
      throw error;
    }

    // Cast the roles to the expected type
    return (data || []).map(employee => ({
      ...employee,
      role: employee.role as 'admin' | 'drafter' | 'filer'
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    toast.error("Failed to load employees");
    return [];
  }
};

export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    // Cast the role to the expected type
    return {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer'
    };
  } catch (error) {
    console.error("Error fetching employee:", error);
    toast.error("Failed to load employee details");
    return null;
  }
};

// Added function to create a new employee
export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .insert({
        emp_id: employee.emp_id,
        full_name: employee.full_name,
        email: employee.email,
        ph_no: employee.ph_no,
        password: employee.password,
        role: employee.role
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      role: data.role as 'admin' | 'drafter' | 'filer'
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    toast.error("Failed to create employee");
    return null;
  }
};

// Added function to update an employee
export const updateEmployee = async (id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("employees")
      .update(employee)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating employee:", error);
    toast.error("Failed to update employee");
    return false;
  }
};

// Check if employee has any patents assigned before deletion
export const checkEmployeePatentAssignments = async (employeeName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select("id")
      .or(`ps_drafter_assgn.eq.${employeeName},ps_filer_assgn.eq.${employeeName},cs_drafter_assgn.eq.${employeeName},cs_filer_assgn.eq.${employeeName},fer_drafter_assgn.eq.${employeeName},fer_filer_assgn.eq.${employeeName}`)
      .limit(1);

    if (error) {
      throw error;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error("Error checking employee patent assignments:", error);
    return true; // Assume they have assignments to be safe
  }
};

// Updated function to delete an employee with patent assignment validation
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    // First get the employee details
    const employee = await fetchEmployeeById(id);
    if (!employee) {
      toast.error("Employee not found");
      return false;
    }

    // Check if employee has any patents assigned
    const hasPatentAssignments = await checkEmployeePatentAssignments(employee.full_name);
    
    if (hasPatentAssignments) {
      toast.error(`Cannot delete ${employee.full_name} as they have patents assigned to them. Please reassign their patents first.`);
      return false;
    }

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.success("Employee deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    toast.error("Failed to delete employee");
    return false;
  }
};

// Function to validate employee names for bulk upload
export const validateEmployeeExists = async (employeeName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("id")
      .eq("full_name", employeeName)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error validating employee:", error);
    return false;
  }
};
