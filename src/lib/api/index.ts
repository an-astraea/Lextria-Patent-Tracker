import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { Patent, PatentFormData, EmployeeFormData, Employee, InventorInfo, FEREntry } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch all patents
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data: patents, error } = await supabase
      .from('patents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patents:', error);
      return [];
    }

    return patents || [];
  } catch (error) {
    console.error('Error fetching patents:', error);
    return [];
  }
};

// Function to fetch a single patent by ID
export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data: patent, error } = await supabase
      .from('patents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patent by ID:', error);
      return null;
    }

    // Fetch inventors for the patent
    const { data: inventors, error: inventorsError } = await supabase
      .from('inventors')
      .select('*')
      .eq('tracking_id', patent.tracking_id);

    if (inventorsError) {
      console.error('Error fetching inventors:', inventorsError);
      return null;
    }
    
    // Fetch FER entries for the patent
    const { data: ferEntries, error: ferEntriesError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', id);

    if (ferEntriesError) {
      console.error('Error fetching FER entries:', ferEntriesError);
      return null;
    }

    return { ...patent, inventors, fer_entries: ferEntries } || null;
  } catch (error) {
    console.error('Error fetching patent by ID:', error);
    return null;
  }
};

// Function to create a new patent
export const createPatent = async (patentData: PatentFormData): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .insert([patentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating patent:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating patent:', error);
    return null;
  }
};

// Function to update an existing patent
export const updatePatent = async (id: string, patentData: PatentFormData): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(patentData)
      .eq('id', id);

    if (error) {
      console.error('Error updating patent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating patent:', error);
    return false;
  }
};

// Function to update patent status
export const updatePatentStatus = async (patentId: string, field: string, value: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ [field]: value })
      .eq('id', patentId);

    if (error) {
      console.error(`Error updating ${field}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    return false;
  }
};

// Function to update patent payment information
export const updatePatentPayment = async (patentId: string, paymentData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(paymentData)
      .eq('id', patentId);

    if (error) {
      console.error('Error updating payment info:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating payment info:', error);
    return false;
  }
};

// Function to fetch all employees
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }

    return employees || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

// Function to fetch a single employee by ID
export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) {
        console.error('Error fetching employee by ID:', error);
        return null;
      }
  
      return employee || null;
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }
  };

// Function to create a new employee
export const createEmployee = async (employeeData: EmployeeFormData): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
};

// Function to update an existing employee
export const updateEmployee = async (id: string, employeeData: EmployeeFormData): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id);

    if (error) {
      console.error('Error updating employee:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating employee:', error);
    return false;
  }
};

// Function to delete an employee
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Function to create a new inventor
export const createInventor = async (inventorData: InventorInfo): Promise<InventorInfo | null> => {
    try {
      const { data, error } = await supabase
        .from('inventors')
        .insert([inventorData])
        .select()
        .single();
  
      if (error) {
        console.error('Error creating inventor:', error);
        return null;
      }
  
      return data;
    } catch (error) {
      console.error('Error creating inventor:', error);
      return null;
    }
  };

// Function to fetch patent timeline
export const fetchPatentTimeline = async (patentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patent timeline:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching patent timeline:', error);
    return [];
  }
};

// Function to add event to patent timeline
export const addTimelineEvent = async (
  patentId: string,
  event_type: string,
  event_description: string,
  status: number,
  employee_name: string | null = null,
  deadline_date: string | null = null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patient_timeline')
      .insert([{
        patent_id: patentId,
        event_type,
        event_description,
        status,
        employee_name,
        deadline_date
      }]);

    if (error) {
      console.error('Error adding timeline event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding timeline event:', error);
    return false;
  }
};

// Function to update timeline event status
export const updateTimelineEventStatus = async (eventId: string, status: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patient_timeline')
      .update({ status })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating timeline event status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating timeline event status:', error);
    return false;
  }
};

// Function to create a new FER entry
export const createFEREntry = async (
  patentId: string,
  ferNumber: number,
  ferDrafterAssgn: string | null,
  ferDrafterDeadline: string | null,
  ferFilerAssgn: string | null,
  ferFilerDeadline: string | null
): Promise<FEREntry | null> => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .insert([{
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: ferDrafterAssgn,
        fer_drafter_deadline: ferDrafterDeadline,
        fer_filer_assgn: ferFilerAssgn,
        fer_filer_deadline: ferFilerDeadline
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

// Function to update an existing FER entry
export const updateFEREntry = async (id: string, ferData: Partial<FEREntry>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', id);

    if (error) {
      console.error('Error updating FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
};

// Function to delete an existing FER entry
export const deleteFEREntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
};

export const updatePatentForms = async (
  patentId: string, 
  formData: Record<string, boolean>
): Promise<boolean> => {
  try {
    // Convert form names to use database convention (form_01 instead of form_1)
    const convertedFormData: Record<string, boolean> = {};
    
    // Process each form field
    Object.entries(formData).forEach(([key, value]) => {
      // Keep key as is if it already follows the database naming convention (form_01, form_02_ps, etc.)
      if (key.match(/^form_0\d/) || key.includes('_cs') || key.includes('_ps')) {
        convertedFormData[key] = value;
      } 
      // Convert form_1 to form_01, etc.
      else if (key.match(/^form_\d$/)) {
        const formNumber = key.split('_')[1];
        convertedFormData[`form_0${formNumber}`] = value;
      }
      // Convert form_10 and above (keep as is)
      else if (key.match(/^form_\d\d$/)) {
        convertedFormData[key] = value;
      }
    });
    
    const { data, error } = await supabase
      .from('patents')
      .update(convertedFormData)
      .eq('id', patentId);
      
    if (error) {
      console.error('Error updating patent forms:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updatePatentForms:', error);
    return false;
  }
};
