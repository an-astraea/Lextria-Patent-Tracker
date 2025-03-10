
import { supabase } from '@/integrations/supabase/client';
import { Patent, FEREntry, EmployeeFormData } from './types';

/**
 * Approve a FER draft review
 * @param ferId - ID of the FER entry
 * @returns True if successfully approved
 */
export const approveFERDraft = async (ferId: string): Promise<boolean> => {
  try {
    // Find the FER entry
    const { data: ferEntry, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('id', ferId)
      .single();
      
    if (ferError || !ferEntry) {
      console.error('Error fetching FER entry:', ferError);
      return false;
    }
    
    // Update the FER entry to approve the draft
    const { error: updateError } = await supabase
      .from('fer_entries')
      .update({
        fer_review_draft_status: 0
      })
      .eq('id', ferId);
    
    if (updateError) {
      console.error('Error approving FER draft:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error approving FER draft:', error);
    return false;
  }
};

/**
 * Approve a FER filing review
 * @param ferId - ID of the FER entry
 * @returns True if successfully approved
 */
export const approveFERFiling = async (ferId: string): Promise<boolean> => {
  try {
    // Find the FER entry
    const { data: ferEntry, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('id', ferId)
      .single();
      
    if (ferError || !ferEntry) {
      console.error('Error fetching FER entry:', ferError);
      return false;
    }
    
    // Update the FER entry status
    const { error: updateError } = await supabase
      .from('fer_entries')
      .update({
        fer_review_file_status: 0
      })
      .eq('id', ferId);
    
    if (updateError) {
      console.error('Error approving FER filing:', updateError);
      return false;
    }
    
    // Check if both draft and file are completed to update completion status
    if (ferEntry.fer_drafter_status === 1 && ferEntry.fer_filing_status === 1) {
      const { error: completionError } = await supabase
        .from('fer_entries')
        .update({
          fer_completion_status: 1
        })
        .eq('id', ferId);
      
      if (completionError) {
        console.error('Error updating FER completion status:', completionError);
        // Still return true as the main approval was successful
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error approving FER filing:', error);
    return false;
  }
};

// Add all the missing API functions
export const fetchPatents = async (): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*), inventors(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching patents:', error);
    return [];
  }
};

export const fetchPatentById = async (id: string): Promise<Patent | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*), inventors(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patent by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching patent by ID:', error);
    return null;
  }
};

export const updatePatentStatus = async (
  patentId: string,
  field: string,
  value: number | boolean
): Promise<boolean> => {
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
    console.error('Error updating patent status:', error);
    return false;
  }
};

export const updatePatentPayment = async (
  patentId: string,
  paymentData: {
    payment_status: string;
    payment_amount: number;
    payment_received: number;
    invoice_sent: boolean;
  }
): Promise<boolean> => {
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

export const createPatent = async (
  patentData: Partial<Patent>
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .insert([patentData])
      .select();

    if (error) {
      console.error('Error creating patent:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error creating patent:', error);
    return null;
  }
};

export const updatePatent = async (
  id: string,
  patentData: Partial<Patent>
): Promise<boolean> => {
  try {
    const { error } = await supabase
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

export const createInventor = async (
  inventorData: {
    tracking_id: string;
    inventor_name: string;
    inventor_addr: string;
    patent_id: string;
  }
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('inventors')
      .insert([inventorData])
      .select();

    if (error) {
      console.error('Error creating inventor:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error creating inventor:', error);
    return null;
  }
};

export const createFEREntry = async (
  patentId: string,
  ferNumber: number,
  ferDrafter: string | null,
  ferDrafterDeadline: string | null,
  ferFiler: string | null,
  ferFilerDeadline: string | null,
  ferDate: string | null
): Promise<string | null> => {
  try {
    const ferData = {
      patent_id: patentId,
      fer_number: ferNumber,
      fer_drafter_assgn: ferDrafter,
      fer_drafter_deadline: ferDrafterDeadline,
      fer_filer_assgn: ferFiler,
      fer_filer_deadline: ferFilerDeadline,
      fer_date: ferDate,
      fer_drafter_status: 0,
      fer_filing_status: 0,
      fer_review_draft_status: 0,
      fer_review_file_status: 0,
      fer_completion_status: 0
    };

    const { data, error } = await supabase
      .from('fer_entries')
      .insert([ferData])
      .select();

    if (error) {
      console.error('Error creating FER entry:', error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error('Error creating FER entry:', error);
    return null;
  }
};

export const updateFEREntry = async (
  ferId: string,
  ferData: Partial<FEREntry>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', ferId);

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

export const deleteFEREntry = async (ferId: string): Promise<boolean> => {
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
    console.error('Error deleting FER entry:', error);
    return false;
  }
};

export const fetchEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
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
      console.error('Error fetching employee:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
};

export const createEmployee = async (employeeData: EmployeeFormData) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select();

    if (error) {
      console.error('Error creating employee:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<EmployeeFormData>) => {
  try {
    const { error } = await supabase
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

export const deleteEmployee = async (id: string) => {
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

export const updatePatentForms = async (
  patentId: string,
  forms: {
    form_18?: boolean;
    form_18a?: boolean;
    form_26?: boolean;
    form_9?: boolean;
    form_9a?: boolean;
    form_13?: boolean;
  }
) => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(forms)
      .eq('id', patentId);

    if (error) {
      console.error('Error updating patent forms:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating patent forms:', error);
    return false;
  }
};

export const fetchPatentsAndEmployees = async () => {
  try {
    const { data: patents, error: patentsError } = await supabase
      .from('patents')
      .select('*, fer_entries(*), inventors(*)')
      .order('created_at', { ascending: false });

    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });

    if (patentsError) {
      console.error('Error fetching patents:', patentsError);
    }

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
    }

    return {
      patents: patents || [],
      employees: employees || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      patents: [],
      employees: []
    };
  }
};

export const deletePatent = async (id: string) => {
  try {
    // First delete related FER entries
    const { error: ferError } = await supabase
      .from('fer_entries')
      .delete()
      .eq('patent_id', id);

    if (ferError) {
      console.error('Error deleting related FER entries:', ferError);
      return false;
    }

    // Then delete related inventors
    const { error: inventorError } = await supabase
      .from('inventors')
      .delete()
      .eq('patent_id', id);

    if (inventorError) {
      console.error('Error deleting related inventors:', inventorError);
      return false;
    }

    // Finally delete the patent
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

export const fetchDrafterAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafter assignments:', error);
      return [];
    }

    // Filter to only include active assignments (not completed or under review)
    return (data || []).filter(patent => {
      const psDrafterAssigned = patent.ps_drafter_assgn === drafterName;
      const csDrafterAssigned = patent.cs_drafter_assgn === drafterName;
      
      return (
        (psDrafterAssigned && patent.ps_drafting_status === 0) ||
        (csDrafterAssigned && patent.cs_drafting_status === 0)
      );
    });
  } catch (error) {
    console.error('Error fetching drafter assignments:', error);
    return [];
  }
};

export const fetchDrafterCompletedAssignments = async (drafterName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_drafter_assgn.eq.${drafterName},cs_drafter_assgn.eq.${drafterName}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed drafter assignments:', error);
      return [];
    }

    // Filter to only include completed assignments
    return (data || []).filter(patent => {
      const psDrafterAssigned = patent.ps_drafter_assgn === drafterName;
      const csDrafterAssigned = patent.cs_drafter_assgn === drafterName;
      
      return (
        (psDrafterAssigned && patent.ps_drafting_status === 1) ||
        (csDrafterAssigned && patent.cs_drafting_status === 1)
      );
    });
  } catch (error) {
    console.error('Error fetching completed drafter assignments:', error);
    return [];
  }
};

export const fetchFilerAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filer assignments:', error);
      return [];
    }

    // Filter to only include active assignments (not completed or under review)
    return (data || []).filter(patent => {
      const psFilerAssigned = patent.ps_filer_assgn === filerName;
      const csFilerAssigned = patent.cs_filer_assgn === filerName;
      
      return (
        (psFilerAssigned && patent.ps_filing_status === 0 && patent.ps_drafting_status === 1) ||
        (csFilerAssigned && patent.cs_filing_status === 0 && patent.cs_drafting_status === 1)
      );
    });
  } catch (error) {
    console.error('Error fetching filer assignments:', error);
    return [];
  }
};

export const fetchFilerCompletedAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or(`ps_filer_assgn.eq.${filerName},cs_filer_assgn.eq.${filerName}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed filer assignments:', error);
      return [];
    }

    // Filter to only include completed assignments
    return (data || []).filter(patent => {
      const psFilerAssigned = patent.ps_filer_assgn === filerName;
      const csFilerAssigned = patent.cs_filer_assgn === filerName;
      
      return (
        (psFilerAssigned && patent.ps_filing_status === 1) ||
        (csFilerAssigned && patent.cs_filing_status === 1)
      );
    });
  } catch (error) {
    console.error('Error fetching completed filer assignments:', error);
    return [];
  }
};

export const fetchFilerFERAssignments = async (filerName: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching FER filer assignments:', error);
      return [];
    }

    // Filter to patents with FER entries assigned to this filer
    return (data || []).filter(patent => {
      if (!patent.fer_entries || patent.fer_entries.length === 0) {
        return false;
      }
      
      return patent.fer_entries.some(fer => 
        fer.fer_filer_assgn === filerName && 
        fer.fer_filing_status === 0 && 
        fer.fer_drafter_status === 1 &&
        fer.fer_review_draft_status === 0
      );
    });
  } catch (error) {
    console.error('Error fetching FER filer assignments:', error);
    return [];
  }
};

export const fetchPendingReviews = async () => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }

    // Also get patents with FER entries under review
    const { data: ferData, error: ferError } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .not('fer_entries', 'is', null)
      .order('updated_at', { ascending: false });

    if (ferError) {
      console.error('Error fetching FER reviews:', ferError);
    }

    // Filter FER patents to only those with entries under review
    const ferReviews = (ferData || []).filter(patent => {
      if (!patent.fer_entries || patent.fer_entries.length === 0) {
        return false;
      }
      
      return patent.fer_entries.some(fer => 
        fer.fer_review_draft_status === 1 || 
        fer.fer_review_file_status === 1
      );
    });

    // Combine regular reviews and FER reviews, removing duplicates
    const allPatents = [...(data || [])];
    
    for (const ferPatent of ferReviews) {
      if (!allPatents.some(p => p.id === ferPatent.id)) {
        allPatents.push(ferPatent);
      }
    }

    return allPatents;
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
};

export const completeDrafterTask = async (
  patentId: string,
  taskType: 'ps' | 'cs' | 'fer',
  ferId?: string
) => {
  try {
    if (taskType === 'fer' && ferId) {
      const { error } = await supabase
        .from('fer_entries')
        .update({
          fer_drafter_status: 1,
          fer_review_draft_status: 1
        })
        .eq('id', ferId);

      if (error) {
        console.error('Error completing FER draft task:', error);
        return false;
      }
      
      return true;
    }
    
    const field = 
      taskType === 'ps' 
        ? { ps_drafting_status: 1, ps_review_draft_status: 1 } 
        : { cs_drafting_status: 1, cs_review_draft_status: 1 };
    
    const { error } = await supabase
      .from('patents')
      .update(field)
      .eq('id', patentId);

    if (error) {
      console.error(`Error completing ${taskType} drafting task:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error completing ${taskType} drafting task:`, error);
    return false;
  }
};

export const completeFilerTask = async (
  patentId: string,
  taskType: 'ps' | 'cs'
) => {
  try {
    const field = 
      taskType === 'ps' 
        ? { ps_filing_status: 1, ps_review_file_status: 1 } 
        : { cs_filing_status: 1, cs_review_file_status: 1 };
    
    const { error } = await supabase
      .from('patents')
      .update(field)
      .eq('id', patentId);

    if (error) {
      console.error(`Error completing ${taskType} filing task:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error completing ${taskType} filing task:`, error);
    return false;
  }
};

export const completeFERFilerTask = async (ferId: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({
        fer_filing_status: 1,
        fer_review_file_status: 1
      })
      .eq('id', ferId);

    if (error) {
      console.error('Error completing FER filing task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error completing FER filing task:', error);
    return false;
  }
};

export const approvePatentReview = async (
  patent: Patent,
  reviewType: string
) => {
  try {
    if (reviewType === 'fer_draft' || reviewType === 'fer_file') {
      // Find the FER entry under review
      const ferEntry = patent.fer_entries?.find(fer => 
        (reviewType === 'fer_draft' && fer.fer_review_draft_status === 1) ||
        (reviewType === 'fer_file' && fer.fer_review_file_status === 1)
      );
      
      if (!ferEntry) {
        console.error('No FER entry found under review');
        return false;
      }
      
      if (reviewType === 'fer_draft') {
        return await approveFERDraft(ferEntry.id);
      } else {
        return await approveFERFiling(ferEntry.id);
      }
    }
    
    // Regular patent review approval
    const field = {} as Record<string, number>;
    
    switch (reviewType) {
      case 'ps_draft':
        field.ps_review_draft_status = 0;
        break;
      case 'ps_file':
        field.ps_review_file_status = 0;
        field.ps_completion_status = 1;
        break;
      case 'cs_draft':
        field.cs_review_draft_status = 0;
        break;
      case 'cs_file':
        field.cs_review_file_status = 0;
        field.cs_completion_status = 1;
        break;
      default:
        return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(field)
      .eq('id', patent.id);

    if (error) {
      console.error(`Error approving ${reviewType} review:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error approving ${reviewType} review:`, error);
    return false;
  }
};

export const rejectPatentReview = async (
  patent: Patent,
  reviewType: string
) => {
  try {
    if (reviewType === 'fer_draft' || reviewType === 'fer_file') {
      // Find the FER entry under review
      const ferEntry = patent.fer_entries?.find(fer => 
        (reviewType === 'fer_draft' && fer.fer_review_draft_status === 1) ||
        (reviewType === 'fer_file' && fer.fer_review_file_status === 1)
      );
      
      if (!ferEntry) {
        console.error('No FER entry found under review');
        return false;
      }
      
      const field = {} as Record<string, number>;
      
      if (reviewType === 'fer_draft') {
        field.fer_review_draft_status = 0;
        field.fer_drafter_status = 0;
      } else {
        field.fer_review_file_status = 0;
        field.fer_filing_status = 0;
      }
      
      const { error } = await supabase
        .from('fer_entries')
        .update(field)
        .eq('id', ferEntry.id);

      if (error) {
        console.error(`Error rejecting FER ${reviewType} review:`, error);
        return false;
      }
      
      return true;
    }
    
    // Regular patent review rejection
    const field = {} as Record<string, number>;
    
    switch (reviewType) {
      case 'ps_draft':
        field.ps_review_draft_status = 0;
        field.ps_drafting_status = 0;
        break;
      case 'ps_file':
        field.ps_review_file_status = 0;
        field.ps_filing_status = 0;
        break;
      case 'cs_draft':
        field.cs_review_draft_status = 0;
        field.cs_drafting_status = 0;
        break;
      case 'cs_file':
        field.cs_review_file_status = 0;
        field.cs_filing_status = 0;
        break;
      default:
        return false;
    }
    
    const { error } = await supabase
      .from('patents')
      .update(field)
      .eq('id', patent.id);

    if (error) {
      console.error(`Error rejecting ${reviewType} review:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error rejecting ${reviewType} review:`, error);
    return false;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
    
    // In a real app, this would use proper password hashing
    if (data.password !== password) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
    
    // Return user data without the password
    const { password: _, ...userData } = data;
    
    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};
