import { supabase } from "@/integrations/supabase/client";
import { 
  Patent, 
  PatentFormData, 
  PatentFilters, 
  handlePatentResponse,
  formatDateForDatabase
} from "../types";

// Fetch all patents with optional filters
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

// Fetch single patent by ID with related entities
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

// Create new patent
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

// Update existing patent
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

// Delete patent
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

// Update patent status
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

// Update patent forms
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

// Update patent notes
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

// Update payment details
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

// Create FER entry
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
