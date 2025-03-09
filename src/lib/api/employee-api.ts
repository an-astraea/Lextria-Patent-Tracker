
import { supabase } from './client';
import { EmployeeFormData } from '../types';

// Function to fetch all employees
export const fetchEmployees = async () => {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*');

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return employees;
};

// Function to fetch a specific employee by ID
export const fetchEmployeeById = async (id: string) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching employee by ID:', error);
    return null;
  }

  return data;
};

// Function to create a new employee
export const createEmployee = async (employeeData: EmployeeFormData) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([
      {
        emp_id: employeeData.emp_id,
        full_name: employeeData.full_name,
        email: employeeData.email,
        ph_no: employeeData.ph_no,
        password: employeeData.password,
        role: employeeData.role,
      }
    ])
    .select();

  if (error) {
    console.error('Error creating employee:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

// Function to update an existing employee
export const updateEmployee = async (id: string, employeeData: Partial<EmployeeFormData>) => {
  const { data, error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating employee:', error);
    return false;
  }

  return true;
};

// Function to delete an employee
export const deleteEmployee = async (id: string) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting employee:', error);
    return false;
  }

  return true;
};

// Login user function
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (error) {
      console.error('Error logging in:', error);
      return { success: false, message: 'Invalid credentials' };
    }
    
    if (!data) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Return user data (excluding password)
    const { password: _, ...user } = data;
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, message: 'An error occurred during login' };
  }
};
