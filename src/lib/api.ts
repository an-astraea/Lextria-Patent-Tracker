import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { EmployeeFormData, FEREntry, PatentFormData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to fetch all patents
export const fetchPatents = async () => {
  const { data: patents, error } = await supabase
    .from('patents')
    .select(`
      *,
      inventors (*),
      fer_history (*),
      fer_entries (*)
    `);

  if (error) {
    console.error('Error fetching patents:', error);
    return { patents: [], error };
  }

  return { patents, error: null };
};

// Function to fetch a single patent by ID
export const fetchPatentById = async (id: string) => {
  const { data: patent, error } = await supabase
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

  return patent;
};

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

// Function to fetch patents and employees
export const fetchPatentsAndEmployees = async () => {
  const { data: patents, error: patentError } = await supabase
    .from('patents')
    .select('*');

  const { data: employees, error: employeeError } = await supabase
    .from('employees')
    .select('*');

  if (patentError) {
    console.error('Error fetching patents:', patentError);
    return { patents: [], employees: [], error: patentError };
  }

  if (employeeError) {
    console.error('Error fetching employees:', employeeError);
    return { patents: patents || [], employees: [], error: employeeError };
  }

  return { patents: patents || [], employees: employees || [], error: null };
};

// Function to create a new patent
export const createPatent = async (patentData: PatentFormData) => {
  const { data, error } = await supabase
    .from('patents')
    .insert([
      {
        tracking_id: patentData.tracking_id,
        patent_applicant: patentData.patent_applicant,
        client_id: patentData.client_id,
        application_no: patentData.application_no,
        date_of_filing: patentData.date_of_filing,
        patent_title: patentData.patent_title,
        applicant_addr: patentData.applicant_addr,
        inventor_ph_no: patentData.inventor_ph_no,
        inventor_email: patentData.inventor_email,
        ps_drafting_status: 0, // Set initial status to 0
        ps_drafter_assgn: patentData.ps_drafter_assgn,
        ps_drafter_deadline: patentData.ps_drafter_deadline,
        ps_review_draft_status: 0,
        ps_filing_status: 0, // Set initial status to 0
        ps_filer_assgn: patentData.ps_filer_assgn,
        ps_filer_deadline: patentData.ps_filer_deadline,
        ps_review_file_status: 0,
        ps_completion_status: 0, // Set initial status to 0
        cs_drafting_status: 0, // Set initial status to 0
        cs_drafter_assgn: patentData.cs_drafter_assgn,
        cs_drafter_deadline: patentData.cs_drafter_deadline,
        cs_review_draft_status: 0,
        cs_filing_status: 0, // Set initial status to 0
        cs_filer_assgn: patentData.cs_filer_assgn,
        cs_filer_deadline: patentData.cs_filer_deadline,
        cs_review_file_status: 0,
        cs_completion_status: 0, // Set initial status to 0
        fer_status: patentData.fer_status,
        fer_drafter_assgn: patentData.fer_drafter_assgn,
        fer_drafter_deadline: patentData.fer_drafter_deadline,
        fer_review_draft_status: 0,
        fer_filing_status: 0,
        fer_filer_assgn: patentData.fer_filer_assgn,
        fer_filer_deadline: patentData.fer_filer_deadline,
        fer_review_file_status: 0,
        fer_completion_status: 0,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating patent:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

// Function to update an existing patent
export const updatePatent = async (id: string, patentData: PatentFormData) => {
  const { data, error } = await supabase
    .from('patents')
    .update({
      tracking_id: patentData.tracking_id,
      patent_applicant: patentData.patent_applicant,
      client_id: patentData.client_id,
      application_no: patentData.application_no,
      date_of_filing: patentData.date_of_filing,
      patent_title: patentData.patent_title,
      applicant_addr: patentData.applicant_addr,
      inventor_ph_no: patentData.inventor_ph_no,
      inventor_email: patentData.inventor_email,
      ps_drafter_assgn: patentData.ps_drafter_assgn,
      ps_drafter_deadline: patentData.ps_drafter_deadline,
      ps_filer_assgn: patentData.ps_filer_assgn,
      ps_filer_deadline: patentData.ps_filer_deadline,
      cs_drafter_assgn: patentData.cs_drafter_assgn,
      cs_drafter_deadline: patentData.cs_drafter_deadline,
      cs_filer_assgn: patentData.cs_filer_assgn,
      cs_filer_deadline: patentData.cs_filer_deadline,
      fer_status: patentData.fer_status,
      fer_drafter_assgn: patentData.fer_drafter_assgn,
      fer_drafter_deadline: patentData.fer_drafter_deadline,
      fer_filer_assgn: patentData.fer_filer_assgn,
      fer_filer_deadline: patentData.fer_filer_deadline,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating patent:', error);
    return false;
  }

  return true;
};

// Function to delete a patent
export const deletePatent = async (id: string) => {
  const { error } = await supabase
    .from('patents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting patent:', error);
    return false;
  }

  return true;
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
      },
    ])
    .select();

  if (error) {
    console.error('Error creating employee:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

// Function to update an existing employee
export const updateEmployee = async (id: string, employeeData: EmployeeFormData) => {
  const { data, error } = await supabase
    .from('employees')
    .update({
      emp_id: employeeData.emp_id,
      full_name: employeeData.full_name,
      email: employeeData.email,
      ph_no: employeeData.ph_no,
      role: employeeData.role,
    })
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

// Function to create a new inventor
export const createInventor = async (inventorData: { tracking_id: string; inventor_name: string; inventor_addr: string }) => {
  const { data, error } = await supabase
    .from('inventors')
    .insert([
      {
        tracking_id: inventorData.tracking_id,
        inventor_name: inventorData.inventor_name,
        inventor_addr: inventorData.inventor_addr,
      },
    ])
    .select();

  if (error) {
    console.error('Error creating inventor:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

// Function to update patent notes
export const updatePatentNotes = async (patentId: string, notes: string) => {
  const { data, error } = await supabase
    .from('patents')
    .update({ notes })
    .eq('id', patentId)
    .select();

  if (error) {
    console.error('Error updating patent notes:', error);
    return false;
  }

  return true;
};

// Function to fetch patent timeline
export const fetchPatentTimeline = async (patentId: string) => {
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
};

// Function to update patent forms
export const updatePatentForms = async (patentId: string, formData: Record<string, boolean>) => {
  const { data, error } = await supabase
    .from('patents')
    .update(formData)
    .eq('id', patentId)
    .select();
  
  if (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }
  
  return true;
};

// Function to update FER entry
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  const { data, error } = await supabase
    .from('fer_entries')
    .update(ferData)
    .eq('id', ferEntryId)
    .select();
  
  if (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
  
  return true;
};

// Function to delete FER entry
export const deleteFEREntry = async (ferEntryId: string) => {
  const { error } = await supabase
    .from('fer_entries')
    .delete()
    .eq('id', ferEntryId);
  
  if (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
  
  return true;
};

// Function to complete FER drafter task
export const completeFERDrafterTask = async (ferEntry: FEREntry, userName: string) => {
  try {
    // Update the FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_drafter_status: 1, // Mark as completed
        fer_review_draft_status: 1 // Mark as under review
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER drafter task:', error);
      return false;
    }

    // Create a timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Drafting Completed', `FER drafting completed by ${userName}`, 1, userName, ferEntry.fer_drafter_deadline);
    
    return true;
  } catch (error) {
    console.error('Error completing FER drafter task:', error);
    return false;
  }
};

// Function to complete FER filer task
export const completeFERFilerTask = async (ferEntry: FEREntry, userName: string) => {
  try {
    // Update the FER entry
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1, // Mark as completed
        fer_review_file_status: 1 // Mark as under review
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error('Error completing FER filer task:', error);
      return false;
    }

    // Create a timeline event
    await createTimelineEvent(ferEntry.patent_id, 'FER Filing Completed', `FER filing completed by ${userName}`, 1, userName, ferEntry.fer_filer_deadline);
    
    return true;
  } catch (error) {
    console.error('Error completing FER filer task:', error);
    return false;
  }
};

// Function to create a timeline event
export const createTimelineEvent = async (
  patentId: string, 
  eventType: string, 
  eventDescription: string,
  status: number,
  employeeName?: string,
  deadlineDate?: string
) => {
  try {
    const { data, error } = await supabase
      .from('patient_timeline')
      .insert([
        {
          patent_id: patentId,
          event_type: eventType,
          event_description: eventDescription,
          status: status,
          employee_name: employeeName,
          deadline_date: deadlineDate
        },
      ])
      .select();
    
    if (error) {
      console.error('Error creating timeline event:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return null;
  }
};

// Function to update patent status fields
export const updatePatentStatus = async (patentId: string, statusField: string, value: number) => {
  try {
    // Create data object with just the field to update
    const updateData: any = {
      [statusField]: value
    };
    
    // If PS Drafting and PS Filing are both complete, update PS Completion Status
    if (statusField === 'ps_drafting_status' || statusField === 'ps_filing_status') {
      const patent = await fetchPatentById(patentId);
      if (patent) {
        const psDraftComplete = statusField === 'ps_drafting_status' ? value : patent.ps_drafting_status;
        const psFileComplete = statusField === 'ps_filing_status' ? value : patent.ps_filing_status;
        
        if (psDraftComplete === 1 && psFileComplete === 1) {
          updateData.ps_completion_status = 1;
        } else {
          updateData.ps_completion_status = 0;
        }
      }
    }
    
    // If CS Drafting and CS Filing are both complete, update CS Completion Status
    if (statusField === 'cs_drafting_status' || statusField === 'cs_filing_status') {
      const patent = await fetchPatentById(patentId);
      if (patent) {
        const csDraftComplete = statusField === 'cs_drafting_status' ? value : patent.cs_drafting_status;
        const csFileComplete = statusField === 'cs_filing_status' ? value : patent.cs_filing_status;
        
        if (csDraftComplete === 1 && csFileComplete === 1) {
          updateData.cs_completion_status = 1;
        } else {
          updateData.cs_completion_status = 0;
        }
      }
    }
    
    // If FER status is changed, handle appropriately
    if (statusField === 'fer_status') {
      // If FER is being disabled, update all FER-related statuses to 0
      if (value === 0) {
        updateData.fer_drafter_status = 0;
        updateData.fer_filing_status = 0;
        updateData.fer_completion_status = 0;
      } else {
        // If we're enabling FER, make sure to check current FER entries to determine completion status
        const patent = await fetchPatentById(patentId);
        if (patent && patent.fer_entries) {
          // Check if all existing FER entries are complete
          const allFERsComplete = patent.fer_entries.every(
            fer => fer.fer_drafter_status === 1 && fer.fer_filing_status === 1
          );
          
          updateData.fer_completion_status = allFERsComplete ? 1 : 0;
        } else {
          // No FER entries yet, so completion is 0
          updateData.fer_completion_status = 0;
        }
      }
    }
    
    // Update the patent
    const { data, error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patentId)
      .select();
    
    if (error) {
      console.error('Error updating patent status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating patent status:', error);
    return false;
  }
};

// Function to create a new FER entry
export const createFEREntry = async (
  patentId: string, 
  ferNumber: number, 
  ferDrafter?: string, 
  ferDrafterDeadline?: string,
  ferFiler?: string,
  ferFilerDeadline?: string,
  ferDate?: string
) => {
  try {
    // Create the new FER entry
    const { data, error } = await supabase
      .from('fer_entries')
      .insert({
        patent_id: patentId,
        fer_number: ferNumber,
        fer_drafter_assgn: ferDrafter || null,
        fer_drafter_deadline: ferDrafterDeadline || null,
        fer_drafter_status: 0,
        fer_filer_assgn: ferFiler || null,
        fer_filer_deadline: ferFilerDeadline || null,
        fer_filing_status: 0,
        fer_review_draft_status: 0,
        fer_review_file_status: 0,
        fer_completion_status: 0,
        fer_date: ferDate || null
      })
      .select();
    
    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }
    
    // Also update the patent to reflect there's a new FER entry (should set fer_completion_status to 0)
    await supabase
      .from('patents')
      .update({
        fer_status: 1,
        fer_completion_status: 0
      })
      .eq('id', patentId);
    
    return data[0];
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

// Approve a FER review
export const approveFERReview = async (ferEntry: FEREntry, reviewType: 'draft' | 'file') => {
  try {
    const updateData: any = {};
    
    if (reviewType === 'draft') {
      updateData.fer_review_draft_status = 0; // Clear the review status
    } else {
      updateData.fer_review_file_status = 0; // Clear the review status
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update(updateData)
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error(`Error approving FER ${reviewType}:`, error);
      return false;
    }
    
    // After approving the last FER filing, check if all FERs are complete to update the patent status
    if (reviewType === 'file') {
      await updatePatentFERCompletionStatus(ferEntry.patent_id);
    }
    
    return true;
  } catch (error) {
    console.error(`Error approving FER ${reviewType}:`, error);
    return false;
  }
};

// New function to update the patent's FER completion status based on all FER entries
export const updatePatentFERCompletionStatus = async (patentId: string) => {
  try {
    // Fetch all FER entries for this patent
    const { data: ferEntries, error } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', patentId);
    
    if (error) {
      console.error('Error fetching FER entries:', error);
      return false;
    }
    
    // Check if all FER entries are complete
    const allFERsComplete = ferEntries.length > 0 && ferEntries.every(
      fer => fer.fer_drafter_status === 1 && fer.fer_filing_status === 1 && 
             fer.fer_review_draft_status === 0 && fer.fer_review_file_status === 0
    );
    
    // Update the patent's FER completion status
    const { error: updateError } = await supabase
      .from('patents')
      .update({
        fer_completion_status: allFERsComplete ? 1 : 0
      })
      .eq('id', patentId);
    
    if (updateError) {
      console.error('Error updating patent FER completion status:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating patent FER completion status:', error);
    return false;
  }
};
