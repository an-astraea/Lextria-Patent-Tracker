
import { supabase } from "@/integrations/supabase/client";
import { Patent, Inventor, Employee, FEREntry, PatentFormData, PatentFilters, TimelineEvent } from "./types";
import { formatDateForDatabase } from "./utils";

// Helper function to handle API responses
const handleApiResponse = (data: any, error: any) => {
  if (error) {
    console.error("API Error:", error);
    return { error, success: false };
  }
  return { ...data, success: true };
};

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message, success: false };
    }

    if (data.user) {
      // Get user profile details from the employees table
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (employeeError) {
        return { error: employeeError.message, success: false };
      }

      return {
        success: true,
        user: {
          id: employeeData.id,
          email: employeeData.email,
          emp_id: employeeData.emp_id,
          full_name: employeeData.full_name,
          role: employeeData.role
        }
      };
    }

    return { error: "Authentication failed", success: false };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message, success: false };
  }
};

// Patent functions
export const fetchPatents = async (filters?: PatentFilters) => {
  try {
    let query = supabase.from('patents').select('*');
    
    if (filters) {
      // Apply filters if provided
      if (filters.drafter) {
        query = query.or(`ps_drafter_assgn.eq.${filters.drafter},cs_drafter_assgn.eq.${filters.drafter},fer_drafter_assgn.eq.${filters.drafter}`);
      }
      
      if (filters.filer) {
        query = query.or(`ps_filer_assgn.eq.${filters.filer},cs_filer_assgn.eq.${filters.filer},fer_filer_assgn.eq.${filters.filer}`);
      }
      
      if (filters.searchTerm) {
        query = query.or(`patent_title.ilike.%${filters.searchTerm}%,tracking_id.ilike.%${filters.searchTerm}%,patent_applicant.ilike.%${filters.searchTerm}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching patents:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching patents:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchPatentById = async (id: string) => {
  try {
    // Fetch the patent
    const { data: patent, error: patentError } = await supabase
      .from('patents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (patentError) {
      console.error("Error fetching patent:", patentError);
      return { error: patentError.message, patent: null };
    }
    
    // Fetch inventors for the patent
    const { data: inventors, error: inventorsError } = await supabase
      .from('inventors')
      .select('*')
      .eq('tracking_id', patent.tracking_id);
    
    if (inventorsError) {
      console.error("Error fetching inventors:", inventorsError);
    }
    
    // Fetch FER entries for the patent
    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', id);
    
    if (ferError) {
      console.error("Error fetching FER entries:", ferError);
    }
    
    // Combine data
    return {
      ...patent,
      inventors: inventors || [],
      fer_entries: ferEntries || [],
    };
  } catch (error: any) {
    console.error("Exception fetching patent:", error);
    return { error: error.message, patent: null };
  }
};

export const createPatent = async (patentData: PatentFormData) => {
  try {
    // Extract inventors to be created separately
    const { inventors, ...patentFields } = patentData;
    
    // Insert the patent record
    const { data: patentResult, error: patentError } = await supabase
      .from('patents')
      .insert([patentFields])
      .select()
      .single();
    
    if (patentError) {
      console.error("Error creating patent:", patentError);
      return { error: patentError.message, success: false };
    }
    
    // Insert inventors if any
    if (inventors && inventors.length > 0) {
      const inventorsWithTrackingId = inventors.map(inventor => ({
        ...inventor,
        tracking_id: patentData.tracking_id
      }));
      
      const { error: inventorsError } = await supabase
        .from('inventors')
        .insert(inventorsWithTrackingId);
      
      if (inventorsError) {
        console.error("Error creating inventors:", inventorsError);
        // Don't fail the whole operation if inventors fail
      }
    }
    
    // Create FER entry if fer_status is 1
    if (patentData.fer_status === 1) {
      await createFEREntry(
        patentResult.id,
        1,
        patentData.fer_drafter_assgn,
        patentData.fer_drafter_deadline,
        patentData.fer_filer_assgn,
        patentData.fer_filer_deadline
      );
    }
    
    return { success: true, patent: patentResult };
  } catch (error: any) {
    console.error("Exception creating patent:", error);
    return { error: error.message, success: false };
  }
};

export const createInventor = async (patentTrackingId: string, inventorData: { inventor_name: string; inventor_addr: string }) => {
  try {
    const data = {
      tracking_id: patentTrackingId,
      ...inventorData
    };
    
    const { data: result, error } = await supabase
      .from('inventors')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating inventor:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true, inventor: result };
  } catch (error: any) {
    console.error("Exception creating inventor:", error);
    return { error: error.message, success: false };
  }
};

export const updatePatent = async (id: string, patentData: Partial<Patent>) => {
  try {
    // Extract inventors to handle separately
    const { inventors, ...patentFields } = patentData as any;
    
    // Update the patent record
    const { error: patentError } = await supabase
      .from('patents')
      .update(patentFields)
      .eq('id', id);
    
    if (patentError) {
      console.error("Error updating patent:", patentError);
      return { error: patentError.message, success: false };
    }
    
    // Handle inventors if provided
    if (inventors && inventors.length > 0) {
      // Get the tracking_id for the patent
      const { data: patentData } = await supabase
        .from('patents')
        .select('tracking_id')
        .eq('id', id)
        .single();
      
      if (patentData) {
        // Delete existing inventors
        await supabase
          .from('inventors')
          .delete()
          .eq('tracking_id', patentData.tracking_id);
        
        // Insert new inventors
        const inventorsWithTrackingId = inventors.map((inventor: any) => ({
          ...inventor,
          tracking_id: patentData.tracking_id
        }));
        
        const { error: inventorsError } = await supabase
          .from('inventors')
          .insert(inventorsWithTrackingId);
        
        if (inventorsError) {
          console.error("Error updating inventors:", inventorsError);
          // Don't fail the whole operation if inventors fail
        }
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating patent:", error);
    return { error: error.message, success: false };
  }
};

export const updatePatentStatus = async (id: string, field: string, value: number | boolean | string) => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ [field]: value })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating patent ${field}:`, error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Exception updating patent ${field}:`, error);
    return { error: error.message, success: false };
  }
};

export const updatePatentPayment = async (id: string, paymentData: { payment_status: string, payment_amount: number, payment_received: number }) => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(paymentData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating payment details:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating payment details:", error);
    return { error: error.message, success: false };
  }
};

export const updatePatentForms = async (id: string, formData: Record<string, boolean>) => {
  try {
    const { error } = await supabase
      .from('patents')
      .update(formData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating form requirements:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating form requirements:", error);
    return { error: error.message, success: false };
  }
};

export const updatePatentNotes = async (id: string, notes: string) => {
  try {
    const { error } = await supabase
      .from('patents')
      .update({ notes })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating patent notes:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating patent notes:", error);
    return { error: error.message, success: false };
  }
};

export const deletePatent = async (id: string) => {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting patent:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception deleting patent:", error);
    return { error: error.message, success: false };
  }
};

// Employee functions
export const fetchEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (error) {
      console.error("Error fetching employees:", error);
      return { error: error.message, employees: [] };
    }
    
    return { employees: data };
  } catch (error: any) {
    console.error("Exception fetching employees:", error);
    return { error: error.message, employees: [] };
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
      console.error("Error fetching employee:", error);
      return { error: error.message, employee: null };
    }
    
    return data;
  } catch (error: any) {
    console.error("Exception fetching employee:", error);
    return { error: error.message, employee: null };
  }
};

export const createEmployee = async (employeeData: Partial<Employee>) => {
  try {
    // Create the employee record
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        emp_id: employeeData.emp_id,
        full_name: employeeData.full_name,
        email: employeeData.email,
        ph_no: employeeData.ph_no,
        password: employeeData.password,
        role: employeeData.role || 'drafter' // Default to drafter if role not specified
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating employee:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true, employee: data };
  } catch (error: any) {
    console.error("Exception creating employee:", error);
    return { error: error.message, success: false };
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
  try {
    // Update employee record
    const { error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating employee:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating employee:", error);
    return { error: error.message, success: false };
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    // Delete the employee record
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error("Error deleting employee:", deleteError);
      return { error: deleteError.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception deleting employee:", error);
    return { error: error.message, success: false };
  }
};

// FER (First Examination Report) functions
export const createFEREntry = async (
  patentId: string,
  ferNumber: number,
  drafterAssign?: string,
  drafterDeadline?: string,
  filerAssign?: string,
  filerDeadline?: string,
  ferDate?: string
) => {
  try {
    const ferData = {
      patent_id: patentId,
      fer_number: ferNumber,
      fer_drafter_assgn: drafterAssign || null,
      fer_drafter_deadline: drafterDeadline ? formatDateForDatabase(drafterDeadline) : null,
      fer_filer_assgn: filerAssign || null,
      fer_filer_deadline: filerDeadline ? formatDateForDatabase(filerDeadline) : null,
      fer_date: ferDate ? formatDateForDatabase(ferDate) : null,
      fer_drafter_status: 0,
      fer_filing_status: 0,
      fer_review_draft_status: 0,
      fer_review_file_status: 0,
      fer_completion_status: 0
    };
    
    const { data, error } = await supabase
      .from('fer_entries')
      .insert([ferData])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating FER entry:", error);
      return { error: error.message, success: false };
    }
    
    // Update the patent fer_status
    await supabase
      .from('patents')
      .update({
        fer_status: 1,
        fer_completion_status: 0
      })
      .eq('id', patentId);
    
    return data;
  } catch (error: any) {
    console.error("Exception creating FER entry:", error);
    return { error: error.message, success: false };
  }
};

export const updateFEREntry = async (id: string, ferData: Partial<FEREntry>) => {
  try {
    // Format dates if they exist
    if (ferData.fer_drafter_deadline) {
      ferData.fer_drafter_deadline = formatDateForDatabase(ferData.fer_drafter_deadline);
    }
    
    if (ferData.fer_filer_deadline) {
      ferData.fer_filer_deadline = formatDateForDatabase(ferData.fer_filer_deadline);
    }
    
    if (ferData.fer_date) {
      ferData.fer_date = formatDateForDatabase(ferData.fer_date);
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating FER entry:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception updating FER entry:", error);
    return { error: error.message, success: false };
  }
};

export const deleteFEREntry = async (id: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting FER entry:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception deleting FER entry:", error);
    return { error: error.message, success: false };
  }
};

// Workflow functions for Drafters
export const fetchDrafterAssignments = async (drafterId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_drafter_assgn.eq.${drafterId},cs_drafter_assgn.eq.${drafterId}`)
      .or('ps_drafting_status.eq.0,cs_drafting_status.eq.0')
      .eq('ps_review_draft_status', 0)
      .eq('cs_review_draft_status', 0);
    
    if (error) {
      console.error("Error fetching drafter assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching drafter assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchDrafterCompletedAssignments = async (drafterId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_drafter_assgn.eq.${drafterId},cs_drafter_assgn.eq.${drafterId}`)
      .or('ps_drafting_status.eq.1,cs_drafting_status.eq.1');
    
    if (error) {
      console.error("Error fetching completed drafter assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching completed drafter assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchDrafterFERAssignments = async (drafterId: string) => {
  try {
    // First get patents with fer_status = 1
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .eq('fer_status', 1);
    
    if (error) {
      console.error("Error fetching FER assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    // Filter to only include patents with FER entries assigned to this drafter
    const filteredPatents = data.filter(patent => 
      patent.fer_entries && 
      patent.fer_entries.some((entry: any) => 
        entry.fer_drafter_assgn === drafterId && 
        entry.fer_drafter_status === 0
      )
    );
    
    return { patents: filteredPatents };
  } catch (error: any) {
    console.error("Exception fetching FER assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const completeDrafterTask = async (patentId: string, taskType: 'ps' | 'cs') => {
  try {
    const updateData = taskType === 'ps' 
      ? { 
          ps_drafting_status: 1,
          ps_review_draft_status: 1
        } 
      : { 
          cs_drafting_status: 1,
          cs_review_draft_status: 1
        };
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patentId);
    
    if (error) {
      console.error("Error completing drafter task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing drafter task:", error);
    return { error: error.message, success: false };
  }
};

export const completeFERDrafterTask = async (ferEntry: FEREntry, drafterName: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_drafter_status: 1,
        fer_review_draft_status: 1
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error("Error completing FER drafter task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing FER drafter task:", error);
    return { error: error.message, success: false };
  }
};

// Workflow functions for Filers
export const fetchFilerAssignments = async (filerId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_filer_assgn.eq.${filerId},cs_filer_assgn.eq.${filerId}`)
      .or('ps_filing_status.eq.0,cs_filing_status.eq.0')
      .eq('ps_review_file_status', 0)
      .eq('cs_review_file_status', 0)
      .or('ps_drafting_status.eq.1,cs_drafting_status.eq.1');
    
    if (error) {
      console.error("Error fetching filer assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching filer assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchFilerCompletedAssignments = async (filerId: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .or(`ps_filer_assgn.eq.${filerId},cs_filer_assgn.eq.${filerId}`)
      .or('ps_filing_status.eq.1,cs_filing_status.eq.1');
    
    if (error) {
      console.error("Error fetching completed filer assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    return { patents: data };
  } catch (error: any) {
    console.error("Exception fetching completed filer assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const fetchFilerFERAssignments = async (filerId: string) => {
  try {
    // First get patents with fer_status = 1
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .eq('fer_status', 1);
    
    if (error) {
      console.error("Error fetching FER assignments:", error);
      return { error: error.message, patents: [] };
    }
    
    // Filter to only include patents with FER entries assigned to this filer
    const filteredPatents = data.filter(patent => 
      patent.fer_entries && 
      patent.fer_entries.some((entry: any) => 
        entry.fer_filer_assgn === filerId && 
        entry.fer_filing_status === 0 &&
        entry.fer_drafter_status === 1 // Only show if drafting is complete
      )
    );
    
    return { patents: filteredPatents };
  } catch (error: any) {
    console.error("Exception fetching FER assignments:", error);
    return { error: error.message, patents: [] };
  }
};

export const completeFilerTask = async (patentId: string, taskType: 'ps' | 'cs', formData?: Record<string, boolean>) => {
  try {
    let updateData: any = {};
    
    if (taskType === 'ps') {
      updateData = { 
        ps_filing_status: 1,
        ps_review_file_status: 1
      };
    } else {
      updateData = { 
        cs_filing_status: 1,
        cs_review_file_status: 1
      };
      
      // Add form data for CS filing
      if (formData) {
        updateData = { ...updateData, ...formData };
      }
    }
    
    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', patentId);
    
    if (error) {
      console.error("Error completing filer task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing filer task:", error);
    return { error: error.message, success: false };
  }
};

export const completeFERFilerTask = async (ferEntry: FEREntry) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .update({ 
        fer_filing_status: 1,
        fer_review_file_status: 1
      })
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error("Error completing FER filer task:", error);
      return { error: error.message, success: false };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception completing FER filer task:", error);
    return { error: error.message, success: false };
  }
};

// Approval functions for Admin
export const fetchPendingReviews = async () => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*, fer_entries(*)')
      .or('ps_review_draft_status.eq.1,ps_review_file_status.eq.1,cs_review_draft_status.eq.1,cs_review_file_status.eq.1');
    
    if (error) {
      console.error("Error fetching pending reviews:", error);
      return { error: error.message, patents: [] };
    }
    
    // Filter to include FER entries that need review
    const patentsWithFERReviews = data.filter(patent => 
      patent.fer_entries && 
      patent.fer_entries.some((entry: any) => 
        entry.fer_review_draft_status === 1 || entry.fer_review_file_status === 1
      )
    );
    
    // Combine regular patents with FER review patents, deduplicating by ID
    const allPatents = [...data, ...patentsWithFERReviews.filter(p => 
      !data.some(existingP => existingP.id === p.id)
    )];
    
    return allPatents;
  } catch (error: any) {
    console.error("Exception fetching pending reviews:", error);
    return { error: error.message, patents: [] };
  }
};

export const approveReview = async (patent: Patent, reviewType: string) => {
  try {
    let updateData: any = {};
    
    switch(reviewType) {
      case 'ps_draft':
        updateData = { 
          ps_review_draft_status: 0,
          ps_drafting_status: 1
        };
        break;
      case 'ps_file':
        updateData = { 
          ps_review_file_status: 0,
          ps_filing_status: 1,
          ps_completion_status: 1
        };
        break;
      case 'cs_draft':
        updateData = { 
          cs_review_draft_status: 0,
          cs_drafting_status: 1
        };
        break;
      case 'cs_file':
        updateData = { 
          cs_review_file_status: 0,
          cs_filing_status: 1,
          cs_completion_status: 1
        };
        break;
      case 'fer_draft':
        // FER draft approval is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_draft_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_draft_status: 0,
                fer_drafter_status: 1
              })
              .eq('id', ferEntry.id);
          }
        }
        return { success: true };
      case 'fer_file':
        // FER file approval is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_file_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_file_status: 0,
                fer_filing_status: 1,
                fer_completion_status: 1
              })
              .eq('id', ferEntry.id);
            
            // Also check if this was the last FER entry to be completed
            await updateFERCompletionStatus(patent.id);
          }
        }
        return { success: true };
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error("Error approving review:", error);
        return { error: error.message, success: false };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception approving review:", error);
    return { error: error.message, success: false };
  }
};

// Alias for the approveReview function
export const approvePatentReview = approveReview;
export const rejectPatentReview = async (patent: Patent, reviewType: string) => {
  try {
    let updateData: any = {};
    
    switch(reviewType) {
      case 'ps_draft':
        updateData = { 
          ps_review_draft_status: 0,
          ps_drafting_status: 0
        };
        break;
      case 'ps_file':
        updateData = { 
          ps_review_file_status: 0,
          ps_filing_status: 0
        };
        break;
      case 'cs_draft':
        updateData = { 
          cs_review_draft_status: 0,
          cs_drafting_status: 0
        };
        break;
      case 'cs_file':
        updateData = { 
          cs_review_file_status: 0,
          cs_filing_status: 0
        };
        break;
      case 'fer_draft':
        // FER draft rejection is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_draft_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_draft_status: 0,
                fer_drafter_status: 0
              })
              .eq('id', ferEntry.id);
          }
        }
        return { success: true };
      case 'fer_file':
        // FER file rejection is handled separately for a specific FER entry
        if (patent.fer_entries && patent.fer_entries.length > 0) {
          const ferEntry = patent.fer_entries.find(entry => entry.fer_review_file_status === 1);
          if (ferEntry) {
            await supabase
              .from('fer_entries')
              .update({ 
                fer_review_file_status: 0,
                fer_filing_status: 0
              })
              .eq('id', ferEntry.id);
          }
        }
        return { success: true };
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('patents')
        .update(updateData)
        .eq('id', patent.id);
      
      if (error) {
        console.error("Error rejecting review:", error);
        return { error: error.message, success: false };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception rejecting review:", error);
    return { error: error.message, success: false };
  }
};

export const approveFERReview = async (ferEntry: FEREntry, reviewType: string) => {
  try {
    let updateData: any = {};
    
    if (reviewType === 'draft') {
      updateData = { 
        fer_review_draft_status: 0
      };
    } else if (reviewType === 'file') {
      updateData = { 
        fer_review_file_status: 0,
        fer_completion_status: 1
      };
    }
    
    const { error } = await supabase
      .from('fer_entries')
      .update(updateData)
      .eq('id', ferEntry.id);
    
    if (error) {
      console.error("Error approving FER review:", error);
      return { error: error.message, success: false };
    }
    
    // Update the patent's FER completion status
    if (reviewType === 'file') {
      await updateFERCompletionStatus(ferEntry.patent_id);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception approving FER review:", error);
    return { error: error.message, success: false };
  }
};

// Helper function to update FER completion status
const updateFERCompletionStatus = async (patentId: string) => {
  try {
    // Get all FER entries for the patent
    const { data: ferEntries, error: ferError } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', patentId);
    
    if (ferError) {
      console.error("Error fetching FER entries:", ferError);
      return false;
    }
    
    // Check if all FER entries are completed
    const allCompleted = ferEntries.every(entry => entry.fer_completion_status === 1);
    
    if (allCompleted) {
      // Update the patent's fer_completion_status
      const { error: updateError } = await supabase
        .from('patents')
        .update({ fer_completion_status: 1 })
        .eq('id', patentId);
      
      if (updateError) {
        console.error("Error updating patent FER completion status:", updateError);
        return false;
      }
    }
    
    return true;
  } catch (error: any) {
    console.error("Exception updating FER completion status:", error);
    return false;
  }
};

// Timeline functions
export const fetchPatentTimeline = async (patentId: string) => {
  try {
    const { data, error } = await supabase
      .from('patent_timeline')
      .select('*')
      .eq('patent_id', patentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching patent timeline:", error);
      return { error: error.message, timeline: [] };
    }
    
    return data;
  } catch (error: any) {
    console.error("Exception fetching patent timeline:", error);
    return { error: error.message, timeline: [] };
  }
};

// Function to fetch patents and employees for displaying in UI
export const fetchPatentsAndEmployees = async () => {
  try {
    // Fetch patents
    const { data: patents, error: patentsError } = await supabase
      .from('patents')
      .select('*');
    
    if (patentsError) {
      console.error("Error fetching patents:", patentsError);
      return { patents: [], employees: [], error: patentsError.message };
    }
    
    // Fetch employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*');
    
    if (employeesError) {
      console.error("Error fetching employees:", employeesError);
      return { patents, employees: [], error: employeesError.message };
    }
    
    return { patents, employees };
  } catch (error: any) {
    console.error("Exception fetching patents and employees:", error);
    return { patents: [], employees: [], error: error.message };
  }
};
