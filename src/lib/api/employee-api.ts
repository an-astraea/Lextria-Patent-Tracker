
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
      role: employee.role as 'admin' | 'drafter' | 'reviewer'
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
      role: data.role as 'admin' | 'drafter' | 'reviewer'
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
      role: data.role as 'admin' | 'drafter' | 'reviewer'
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

// Added function to delete an employee
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    toast.error("Failed to delete employee");
    return false;
  }
};
