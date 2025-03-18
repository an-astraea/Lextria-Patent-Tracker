
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { toast } from "sonner";

/**
 * Fetches all employees
 * @returns Array of employees
 */
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("full_name");
    
    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

/**
 * Fetches an employee by ID
 * @param id - Employee ID
 * @returns Employee object or null
 */
export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    return null;
  }
};

/**
 * Creates a new employee
 * @param employee - Employee data
 * @returns Object with success status, message, and created employee
 */
export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string; employee?: Employee }> => {
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
      .select();
    
    if (error) {
      console.error('Error creating employee:', error);
      return { success: false, message: error.message };
    }
    
    return { 
      success: true, 
      message: 'Employee created successfully',
      employee: data?.[0] as Employee
    };
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Updates an existing employee
 * @param id - Employee ID
 * @param employee - Updated employee data
 * @returns Object with success status and message
 */
export const updateEmployee = async (id: string, employee: Partial<Omit<Employee, 'id'>>): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .update(employee)
      .eq("id", id)
      .select();
    
    if (error) {
      console.error('Error updating employee:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Employee updated successfully' };
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Deletes an employee
 * @param id - Employee ID
 * @returns Object with success status and message
 */
export const deleteEmployee = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error('Error deleting employee:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Employee deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
