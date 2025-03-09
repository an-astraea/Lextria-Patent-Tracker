import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { PatentFormData, EmployeeFormData, Inventor, FEREntry } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch all patents
export async function fetchPatents() {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patents:', error);
      return { patents: [], error: error.message };
    }

    return { patents: data, error: null };
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return { patents: [], error: 'An unexpected error occurred' };
  }
}

// Function to fetch a single patent by ID
export async function fetchPatentById(id: string) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select(`
        *,
        inventors (*),
        fer_history (*),
        fer_entries (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patent by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to fetch all employees
export async function fetchEmployees() {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching employees:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return [];
    }
}

// Function to create a new patent
export async function createPatent(patent: PatentFormData) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .insert([patent])
      .select()
      .single();

    if (error) {
      console.error('Error creating patent:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to update an existing patent
export async function updatePatent(id: string, updates: PatentFormData) {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to delete a patent
export async function deletePatent(id: string) {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to create a new employee
export async function createEmployee(employee: EmployeeFormData) {
    try {
        const { data, error } = await supabase
            .from('employees')
            .insert([employee])
            .select()
            .single();

        if (error) {
            console.error('Error creating employee:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return null;
    }
}

// Function to update an existing employee
export async function updateEmployee(id: string, updates: EmployeeFormData) {
    try {
        const { data, error } = await supabase
            .from('employees')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating employee:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return false;
    }
}

// Function to delete an employee
export async function deleteEmployee(id: string) {
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
        console.error('An unexpected error occurred:', error);
        return false;
    }
}

// Function to create a new inventor
export async function createInventor(inventor: Omit<Inventor, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .insert([inventor])
      .select()
      .single();

    if (error) {
      console.error('Error creating inventor:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to fetch patent timeline
export async function fetchPatentTimeline(patentId: string) {
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

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
}

// Function to update patent forms
export async function updatePatentForms(patentId: string, formData: Record<string, boolean>) {
  try {
    const { error } = await supabase
      .from('patents')
      .update(formData)
      .eq('id', patentId);

    if (error) {
      console.error('Error updating patent forms:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to create a new FER entry
export async function createFEREntry(
  patentId: string,
  ferNumber: number,
  ferDrafter: string | undefined,
  ferDrafterDeadline: string | undefined,
  ferFiler: string | undefined,
  ferFilerDeadline: string | undefined,
  ferDate?: string | undefined
): Promise<FEREntry | null> {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .insert([{
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: ferDrafter || null,
        fer_drafter_deadline: ferDrafterDeadline || null,
        fer_filer_assgn: ferFiler || null,
        fer_filer_deadline: ferFilerDeadline || null,
        fer_date: ferDate || null,
        fer_drafter_status: 0, // Set initial status to pending
        fer_filing_status: 0,   // Set initial status to pending
        fer_review_draft_status: 0, // Set initial review status to pending
        fer_review_file_status: 0, // Set initial review status to pending
        fer_completion_status: 0 // Set initial completion status to pending
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return null;
  }
}

// Function to update an existing FER entry
export async function updateFEREntry(ferId: string, updates: Partial<FEREntry>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(updates)
      .eq('id', ferId);

    if (error) {
      console.error('Error updating FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to delete a FER entry
export async function deleteFEREntry(ferId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', ferId);

    if (error) {
      console.error('Error deleting FER entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to complete FER drafter task
export async function completeFERDrafterTask(ferEntry: FEREntry, employeeName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_drafter_status: 1, // Mark as completed
        fer_review_draft_status: 1 // Mark as submitted for review
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER drafter task:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Draft Completed', `FER draft completed by ${employeeName}`, 1, employeeName, ferEntry.fer_drafter_deadline);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to complete FER filer task
export async function completeFERFilerTask(ferEntry: FEREntry, employeeName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_filing_status: 1, // Mark as completed
        fer_review_file_status: 1 // Mark as submitted for review
      })
      .eq('id', ferEntry.id);

    if (error) {
      console.error('Error completing FER filer task:', error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Filing Completed', `FER filing completed by ${employeeName}`, 1, employeeName, ferEntry.fer_filer_deadline);

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

// Function to approve FER review
export async function approveFERReview(ferEntry: FEREntry, stage: 'draft' | 'file'): Promise<boolean> {
  try {
    let updateData: { fer_review_draft_status?: number; fer_review_file_status?: number; fer_completion_status?: number } = {};

    if (stage === 'draft') {
      updateData = { fer_review_draft_status: 2 }; // Mark draft review as approved
    } else if (stage === 'file') {
      updateData = { 
        fer_review_file_status: 2, // Mark file review as approved
        fer_completion_status: 1 // Mark FER as completed
      };

      // Check if all FER entries are complete
      const patent = await fetchPatentById(ferEntry.patent_id);
      if (patent && patent.fer_entries) {
        const allFERsComplete = patent.fer_entries.every(entry => entry.fer_completion_status === 1);

        if (allFERsComplete) {
          // Update the patent's FER completion status
          await supabase
            .from('patents')
            .update({ fer_completion_status: 1 })
            .eq('id', ferEntry.patent_id);
        }
      }
    }

    const { error } = await supabase
      .from('fer_entries')
      .update(updateData)
      .eq('id', ferEntry.id);

    if (error) {
      console.error(`Error approving FER ${stage} review:`, error);
      return false;
    }

    // Create timeline event
    await createTimelineEvent(ferEntry.patent_id, `FER ${stage} Approved`, `FER ${stage} review approved`, 2);

    return true;
  } catch (error) {
    console.error(`An unexpected error occurred while approving FER ${stage} review:`, error);
    return false;
  }
}

// Function to create a timeline event
async function createTimelineEvent(
  patentId: string,
  eventType: string,
  eventDescription: string,
  status: number,
  employeeName?: string,
  deadlineDate?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patient_timeline')
      .insert([{
        patent_id: patentId,
        event_type: eventType,
        event_description: eventDescription,
        status: status,
        employee_name: employeeName,
        deadline_date: deadlineDate
      }]);

    if (error) {
      console.error('Error creating timeline event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

export async function fetchPatentsAndEmployees() {
    try {
        const { data: patents, error: patentsError } = await supabase
            .from('patents')
            .select(`
                *,
                inventors (*),
                fer_history (*),
                fer_entries (*)
            `)
            .order('created_at', { ascending: false });

        if (patentsError) {
            console.error('Error fetching patents:', patentsError);
            return { patents: [], employees: [], error: patentsError.message };
        }

        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (employeesError) {
            console.error('Error fetching employees:', employeesError);
            return { patents: [], employees: [], error: employeesError.message };
        }

        return { patents: patents, employees: employees, error: null };
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return { patents: [], employees: [], error: 'An unexpected error occurred' };
    }
}

// Function to update a patent status field
export async function updatePatentStatus(patentId: string, field: string, value: number | string | boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ [field]: value })
      .eq('id', patentId);
    
    if (error) {
      console.error('Error updating patent status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating patent status:', error);
    return false;
  }
}

// Function to update payment information
export async function updatePatentPayment(
  patentId: string, 
  paymentAmount: number, 
  paymentReceived: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ 
        payment_amount: paymentAmount,
        payment_received: paymentReceived
      })
      .eq('id', patentId);
    
    if (error) {
      console.error('Error updating payment information:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating payment information:', error);
    return false;
  }
}

// Function to update patent notes
export async function updatePatentNotes(patentId: string, notes: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ notes: notes })
      .eq('id', patentId);
    
    if (error) {
      console.error('Error updating patent notes:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating patent notes:', error);
    return false;
  }
}
