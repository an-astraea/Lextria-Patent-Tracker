
import { supabase } from "@/integrations/supabase/client";
import { normalizePatents } from "../utils/type-converters";
import { Patent, PatentFormData } from "../types";

/**
 * Fetches all patents with related data
 * @returns Array of patents
 */
export const fetchPatents = async () => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patents:", error);
      return [];
    }

    return normalizePatents(data || []);
  } catch (error) {
    console.error("Error in fetchPatents:", error);
    return [];
  }
};

/**
 * Fetches a single patent by ID
 * @param id - Patent ID
 * @returns Patent object or null
 */
export const fetchPatentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .select(`
        *,
        inventors (*),
        fer_entries (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching patent by ID:", error);
      return null;
    }

    return data ? normalizePatents([data])[0] : null;
  } catch (error) {
    console.error("Error in fetchPatentById:", error);
    return null;
  }
};

/**
 * Creates a new patent
 * @param patentData - Patent form data
 * @returns Object with success status, message, and created patent
 */
export const createPatent = async (patentData: PatentFormData) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .insert([
        {
          tracking_id: patentData.tracking_id,
          internal_tracking_id: patentData.internal_tracking_id || null,
          patent_applicant: patentData.patent_applicant,
          client_id: patentData.client_id,
          application_no: patentData.application_no,
          date_of_filing: patentData.date_of_filing,
          patent_title: patentData.patent_title,
          applicant_addr: patentData.applicant_addr,
          inventor_ph_no: patentData.inventor_ph_no,
          inventor_email: patentData.inventor_email,
          ps_drafting_status: 0, // Set initial status to 0
          ps_drafter_assgn: patentData.ps_drafter_assgn || null,
          ps_drafter_deadline: patentData.ps_drafter_deadline || null,
          ps_review_draft_status: 0,
          ps_filing_status: 0, // Set initial status to 0
          ps_filer_assgn: patentData.ps_filer_assgn || null,
          ps_filer_deadline: patentData.ps_filer_deadline || null,
          ps_review_file_status: 0,
          ps_completion_status: 0, // Set initial status to 0
          cs_drafting_status: 0, // Set initial status to 0
          cs_drafter_assgn: patentData.cs_drafter_assgn || null,
          cs_drafter_deadline: patentData.cs_drafter_deadline || null,
          cs_review_draft_status: 0,
          cs_filing_status: 0, // Set initial status to 0
          cs_filer_assgn: patentData.cs_filer_assgn || null,
          cs_filer_deadline: patentData.cs_filer_deadline || null,
          cs_review_file_status: 0,
          cs_completion_status: 0, // Set initial status to 0
          fer_status: patentData.fer_status,
          fer_drafter_assgn: patentData.fer_drafter_assgn || null,
          fer_drafter_deadline: patentData.fer_drafter_deadline || null,
          fer_review_draft_status: 0,
          fer_filing_status: 0,
          fer_filer_assgn: patentData.fer_filer_assgn || null,
          fer_filer_deadline: patentData.fer_filer_deadline || null,
          fer_review_file_status: 0,
          fer_completion_status: 0,
          idf_sent: patentData.idf_sent || false,
          idf_received: patentData.idf_received || false,
          cs_data: patentData.cs_data || false,
          cs_data_received: patentData.cs_data_received || false,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating patent:", error);
      return { success: false, message: error.message, patent: null };
    }

    if (patentData.inventors && patentData.inventors.length > 0) {
      const inventorsToInsert = patentData.inventors.map((inventor) => ({
        tracking_id: patentData.tracking_id,
        inventor_name: inventor.inventor_name,
        inventor_addr: inventor.inventor_addr,
      }));

      const { error: inventorsError } = await supabase
        .from("inventors")
        .insert(inventorsToInsert);

      if (inventorsError) {
        console.error("Error adding inventors:", inventorsError);
        return {
          success: true,
          message: "Patent created but failed to add inventors",
          patent: data[0],
        };
      }
    }

    return { success: true, message: "Patent created successfully", patent: data[0] };
  } catch (error: any) {
    console.error("Error in createPatent:", error);
    return { success: false, message: error.message || "An unexpected error occurred", patent: null };
  }
};

/**
 * Updates an existing patent
 * @param id - Patent ID
 * @param patentData - Updated patent form data
 * @returns Object with success status and message
 */
export const updatePatent = async (id: string, patentData: Partial<PatentFormData>) => {
  try {
    const { data, error } = await supabase
      .from("patents")
      .update(patentData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating patent:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Patent updated successfully" };
  } catch (error: any) {
    console.error("Error in updatePatent:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

/**
 * Deletes a patent
 * @param id - Patent ID
 * @returns Object with success status and message
 */
export const deletePatent = async (id: string) => {
  try {
    const { error } = await supabase.from("patents").delete().eq("id", id);

    if (error) {
      console.error("Error deleting patent:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Patent deleted successfully" };
  } catch (error: any) {
    console.error("Error in deletePatent:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};

/**
 * Updates patent status fields
 * @param patentId - Patent ID
 * @param statusField - Status field to update
 * @param value - New value for the status field
 * @returns Object with success status and message
 */
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
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Patent status updated successfully' };
  } catch (error: any) {
    console.error('Error updating patent status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Updates patent notes
 * @param patentId - Patent ID
 * @param notes - New notes content
 * @returns Object with success status and message
 */
export const updatePatentNotes = async (patentId: string, notes: string) => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .update({ notes })
      .eq('id', patentId)
      .select();

    if (error) {
      console.error('Error updating patent notes:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Notes updated successfully' };
  } catch (error: any) {
    console.error('Error updating patent notes:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
