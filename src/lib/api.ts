import { supabase } from '@/integrations/supabase/client';
import { FEREntry, InventorInfo, Patent, PatentFormData, Employee, EmployeeFormData } from './types';
import { format } from 'date-fns';

// Patent API functions
export async function fetchPatents(): Promise<Patent[]> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*), inventors(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching patents:', error);
    return [];
  }
}

export async function fetchPatentById(id: string): Promise<Patent | null> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*), inventors(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching patent by ID:', error);
    return null;
  }
}

export async function createPatent(patentData: PatentFormData): Promise<Patent | null> {
  try {
    // Remove inventors array from the data as it's handled separately
    const { inventors, ...patentDataWithoutInventors } = patentData;
    
    const { data, error } = await supabase
      .from('patents')
      .insert([patentDataWithoutInventors])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating patent:', error);
    return null;
  }
}

export async function updatePatent(id: string, patentData: Partial<PatentFormData>): Promise<boolean> {
  try {
    // Remove inventors array from the data as it's handled separately
    const { inventors, ...patentDataWithoutInventors } = patentData;
    
    const { error } = await supabase
      .from('patents')
      .update(patentDataWithoutInventors)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating patent:', error);
    return false;
  }
}

export async function updatePatentStatus(id: string, field: string, value: number | boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ [field]: value })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating patent status for ${field}:`, error);
    return false;
  }
}

export async function updatePatentPayment(id: string, paymentData: Partial<Patent>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update(paymentData)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating patent payment:', error);
    return false;
  }
}

export async function updatePatentForms(id: string, forms: Record<string, boolean>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patents')
      .update(forms)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }
}

// Inventor API functions
export async function createInventor(inventorData: { 
  tracking_id: string; 
  inventor_name: string; 
  inventor_addr: string;
  patent_id?: string;
}): Promise<InventorInfo | null> {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .insert([inventorData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating inventor:', error);
    return null;
  }
}

// FER Entry API functions
export async function createFEREntry(
  patentId: string,
  ferNumber: number,
  drafterName?: string,
  drafterDeadline?: string,
  filerName?: string,
  filerDeadline?: string,
  ferDate?: string
): Promise<FEREntry | null> {
  try {
    const ferData = {
      patent_id: patentId,
      fer_number: ferNumber,
      fer_drafter_assgn: drafterName || null,
      fer_drafter_deadline: drafterDeadline || null,
      fer_filer_assgn: filerName || null,
      fer_filer_deadline: filerDeadline || null,
      fer_date: ferDate || null
    };

    const { data, error } = await supabase
      .from('fer_entries')
      .insert([ferData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
}

export async function updateFEREntry(id: string, ferData: Partial<FEREntry>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating FER entry:', error);
    return false;
  }
}

export async function deleteFEREntry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting FER entry:', error);
    return false;
  }
}

export async function approveFERDraft(ferId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_review_draft_status: 1
      })
      .eq('id', ferId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error approving FER draft:', error);
    return false;
  }
}

export async function approveFERFiling(ferId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_review_file_status: 1,
        fer_completion_status: 1
      })
      .eq('id', ferId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error approving FER filing:', error);
    return false;
  }
}

// Employee API functions
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    return null;
  }
}

export async function createEmployee(employeeData: EmployeeFormData): Promise<Employee | null> {
  try {
    // Handle optional password, defaulting to a simple one if not provided
    const dataToInsert = {
      ...employeeData,
      password: employeeData.password || 'password123' // Default password if not provided
    };
    
    const { data, error } = await supabase
      .from('employees')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
}

export async function updateEmployee(id: string, employeeData: Partial<EmployeeFormData>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating employee:', error);
    return false;
  }
}

export const deletePatent = async (id: string): Promise<boolean> => {
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
    console.error('Error deleting patent:', error);
    return false;
  }
};

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
}

// Task Management API functions
export async function fetchDrafterAssignments(drafterName: string): Promise<Patent[]> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
}

export async function fetchDrafterCompletedAssignments(drafterName: string): Promise<Patent[]> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching drafter completed assignments:', error);
    return [];
  }
}

export async function fetchFilerAssignments(filerName: string): Promise<Patent[]> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
}

export async function fetchFilerCompletedAssignments(filerName: string): Promise<Patent[]> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching filer completed assignments:', error);
    return [];
  }
}

export async function fetchFilerFERAssignments(filerName: string): Promise<FEREntry[]> {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('fer_filer_assgn', filerName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching filer FER assignments:', error);
    return [];
  }
}

export async function completeDrafterTask(patent: Patent, drafterName: string, ferId?: string): Promise<boolean> {
  try {
    // If FER task
    if (ferId) {
      const { error } = await supabase
        .from('fer_entries')
        .update({
          fer_drafter_status: 1
        })
        .eq('id', ferId);

      if (error) throw error;
      
      // Add timeline entry
      await addTimelineEntry(patent.id, {
        event_type: 'fer_drafting_completed',
        event_description: `FER drafting completed by ${drafterName}`,
        employee_name: drafterName,
        status: 1
      });
      
      return true;
    }
    
    // If PS task
    if (patent.ps_drafter_assgn === drafterName && patent.ps_drafting_status === 0) {
      const { error } = await supabase
        .from('patents')
        .update({
          ps_drafting_status: 1
        })
        .eq('id', patent.id);

      if (error) throw error;
      
      // Add timeline entry
      await addTimelineEntry(patent.id, {
        event_type: 'ps_drafting_completed',
        event_description: `Provisional Specification drafting completed by ${drafterName}`,
        employee_name: drafterName,
        status: 1
      });
      
      return true;
    }
    
    // If CS task
    if (patent.cs_drafter_assgn === drafterName && patent.cs_drafting_status === 0) {
      const { error } = await supabase
        .from('patents')
        .update({
          cs_drafting_status: 1
        })
        .eq('id', patent.id);

      if (error) throw error;
      
      // Add timeline entry
      await addTimelineEntry(patent.id, {
        event_type: 'cs_drafting_completed',
        event_description: `Complete Specification drafting completed by ${drafterName}`,
        employee_name: drafterName,
        status: 1
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error completing ${drafterName} drafting task:`, error);
    return false;
  }
}

export async function completeFilerTask(
  patent: Patent, 
  filerName: string, 
  formValues?: Record<string, boolean>,
  ferId?: string
): Promise<boolean> {
  try {
    // If FER task
    if (ferId) {
      console.log(`Completing FER filing task for FER ID: ${ferId}`);
      const { error } = await supabase
        .from('fer_entries')
        .update({
          fer_filing_status: 1
        })
        .eq('id', ferId);

      if (error) throw error;
      
      // Add timeline entry
      await addTimelineEntry(patent.id, {
        event_type: 'fer_filing_completed',
        event_description: `FER filing completed by ${filerName}`,
        employee_name: filerName,
        status: 1
      });
      
      return true;
    }
    
    // If PS task
    if (patent.ps_filer_assgn === filerName && patent.ps_filing_status === 0) {
      const updates: any = {
        ps_filing_status: 1
      };
      
      // Add in form values if provided
      if (formValues) {
        Object.assign(updates, formValues);
      }
      
      // Set date of filing if it's not already set
      if (!patent.date_of_filing) {
        updates.date_of_filing = format(new Date(), 'yyyy-MM-dd');
      }
      
      const { error } = await supabase
        .from('patents')
        .update(updates)
        .eq('id', patent.id);

      if (error) throw error;
      
      // Add timeline entry
      await addTimelineEntry(patent.id, {
        event_type: 'ps_filing_completed',
        event_description: `Provisional Specification filing completed by ${filerName}`,
        employee_name: filerName,
        status: 1
      });
      
      // Update completion status if both PS drafting and filing are complete
      if (patent.ps_drafting_status === 1) {
        await supabase
          .from('patents')
          .update({
            ps_completion_status: 1
          })
          .eq('id', patent.id);
      }
      
      return true;
    }
    
    // If CS task
    if (patent.cs_filer_assgn === filerName && patent.cs_filing_status === 0) {
      const updates: any = {
        cs_filing_status: 1
      };
      
      // Add in form values if provided
      if (formValues) {
        Object.assign(updates, formValues);
      }
      
      const { error } = await supabase
        .from('patents')
        .update(updates)
        .eq('id', patent.id);

      if (error) throw error;
      
      // Add timeline entry
      await addTimelineEntry(patent.id, {
        event_type: 'cs_filing_completed',
        event_description: `Complete Specification filing completed by ${filerName}`,
        employee_name: filerName,
        status: 1
      });
      
      // Update completion status if both CS drafting and filing are complete
      if (patent.cs_drafting_status === 1) {
        await supabase
          .from('patents')
          .update({
            cs_completion_status: 1
          })
          .eq('id', patent.id);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error completing ${filerName} filing task:`, error);
    return false;
  }
}

export async function completeFERFilerTask(fer: FEREntry, filerName: string): Promise<boolean> {
  try {
    if (!fer || !fer.id) {
      console.error('Invalid FER entry provided');
      return false;
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1
      })
      .eq('id', fer.id);

    if (error) throw error;
    
    // Add timeline entry if a patent_id is provided
    if (fer.patent_id) {
      await addTimelineEntry(fer.patent_id, {
        event_type: 'fer_filing_completed',
        event_description: `FER filing completed by ${filerName}`,
        employee_name: filerName,
        status: 1
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error completing FER filing task:`, error);
    return false;
  }
}

// Approval API functions
export async function fetchPendingReviews(): Promise<Patent[]> {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*), inventors(*)')
      .or(
        'ps_drafting_status.eq.1,cs_drafting_status.eq.1,ps_filing_status.eq.1,cs_filing_status.eq.1'
      )
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
}

export async function approvePatentReview(patent: Patent, reviewType: string): Promise<boolean> {
  try {
    const updates: Record<string, any> = {};
    
    switch (reviewType) {
      case 'ps_drafting':
        updates.ps_review_draft_status = 1;
        break;
      case 'cs_drafting':
        updates.cs_review_draft_status = 1;
        break;
      case 'ps_filing':
        updates.ps_review_file_status = 1;
        updates.ps_completion_status = 1;
        break;
      case 'cs_filing':
        updates.cs_review_file_status = 1;
        updates.cs_completion_status = 1;
        break;
      default:
        throw new Error(`Invalid review type: ${reviewType}`);
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id);

    if (error) throw error;
    
    // Add timeline entry
    await addTimelineEntry(patent.id, {
      event_type: `${reviewType}_approved`,
      event_description: `${reviewType.replace('_', ' ')} approved by admin`,
      status: 1
    });
    
    return true;
  } catch (error) {
    console.error('Error approving patent review:', error);
    return false;
  }
}

export async function rejectPatentReview(patent: Patent, reviewType: string, reason: string): Promise<boolean> {
  try {
    const updates: Record<string, any> = {};
    
    switch (reviewType) {
      case 'ps_drafting':
        updates.ps_drafting_status = 0;
        break;
      case 'cs_drafting':
        updates.cs_drafting_status = 0;
        break;
      case 'ps_filing':
        updates.ps_filing_status = 0;
        break;
      case 'cs_filing':
        updates.cs_filing_status = 0;
        break;
      default:
        throw new Error(`Invalid review type: ${reviewType}`);
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updates)
      .eq('id', patent.id);

    if (error) throw error;
    
    // Add timeline entry
    await addTimelineEntry(patent.id, {
      event_type: `${reviewType}_rejected`,
      event_description: `${reviewType.replace('_', ' ')} rejected by admin. Reason: ${reason}`,
      status: 0
    });
    
    return true;
  } catch (error) {
    console.error('Error rejecting patent review:', error);
    return false;
  }
}

// Authentication API functions
export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: Employee; message?: string }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    
    if (data && data.password === password) {
      // Return success with user data
      return { 
        success: true, 
        user: data 
      };
    }
    
    return { 
      success: false, 
      message: 'Invalid credentials' 
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return { 
      success: false, 
      message: 'Login failed. Please try again.' 
    };
  }
}

// Helper function to add timeline entries
export async function addTimelineEntry(
  patentId: string, 
  entryData: {
    event_type: string;
    event_description: string;
    employee_name?: string;
    deadline_date?: string;
    status?: number;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patent_timeline')
      .insert([{
        patent_id: patentId,
        ...entryData
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding timeline entry:', error);
    return false;
  }
}

// Fetch combined data for dashboard
export async function fetchPatentsAndEmployees(): Promise<{ patents: Patent[]; employees: Employee[] }> {
  try {
    const [patents, employees] = await Promise.all([
      fetchPatents(),
      fetchEmployees()
    ]);
    
    return { patents, employees };
  } catch (error) {
    console.error('Error fetching patents and employees:', error);
    return { patents: [], employees: [] };
  }
}
