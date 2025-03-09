
import { supabase } from '../supabase';
import { Employee, EmployeeFormData } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Fetch all employees
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase.from('employees').select('*');

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

// Add a new employee
export const addEmployee = async (employee: Employee): Promise<boolean> => {
  try {
    const { error } = await supabase.from('employees').insert(employee);

    if (error) {
      console.error('Error adding employee:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding employee:', error);
    return false;
  }
};

// Update an employee
export const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<boolean> => {
  try {
    const { error } = await supabase.from('employees').update(employee).eq('id', id);

    if (error) {
      console.error('Error updating employee:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating employee:', error);
    return false;
  }
};

// Delete an employee
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('employees').delete().eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Create a new employee
export const createEmployee = async (formData: EmployeeFormData): Promise<Employee | null> => {
  try {
    const newEmployee = {
      id: uuidv4(),
      emp_id: formData.emp_id,
      full_name: formData.full_name,
      email: formData.email,
      ph_no: formData.ph_no,
      password: formData.password, // In a real app, you would hash this password
      role: formData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('employees').insert([newEmployee]).select().single();

    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<Employee | null> => {
  try {
    // In a real app, you would use Supabase auth or compare hashed passwords
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error logging in:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};
