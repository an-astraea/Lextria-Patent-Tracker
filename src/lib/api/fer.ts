
import { supabase } from "@/integrations/supabase/client";
import { FEREntry } from "../types";

/**
 * Creates a new FER entry for a patent
 * @param patentId - ID of the patent
 * @param ferNumber - FER number
 * @param ferDrafter - Drafter assigned to FER
 * @param ferDrafterDeadline - Deadline for FER drafting
 * @param ferFiler - Filer assigned to FER
 * @param ferFilerDeadline - Deadline for FER filing
 * @param ferDate - Date of FER
 * @returns Object with success status, message, and created FER entry
 */
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
      return { success: false, message: error.message, entry: null };
    }
    
    // Also update the patent to reflect there's a new FER entry
    await supabase
      .from('patents')
      .update({
        fer_status: 1,
        fer_completion_status: 0
      })
      .eq('id', patentId);
    
    return { 
      success: true, 
      message: 'FER entry created successfully', 
      entry: data?.[0] || null 
    };
  } catch (error: any) {
    console.error('Error creating FER entry:', error);
    return { success: false, message: error.message || 'An unexpected error occurred', entry: null };
  }
};

/**
 * Updates an existing FER entry
 * @param ferEntryId - ID of the FER entry
 * @param ferData - Updated FER data
 * @returns Object with success status and message
 */
export const updateFEREntry = async (ferEntryId: string, ferData: Partial<FEREntry>) => {
  try {
    const { data, error } = await supabase
      .from('fer_entries')
      .update(ferData)
      .eq('id', ferEntryId)
      .select();
    
    if (error) {
      console.error('Error updating FER entry:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'FER entry updated successfully' };
  } catch (error: any) {
    console.error('Error updating FER entry:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Deletes an FER entry
 * @param ferEntryId - ID of the FER entry to delete
 * @returns Object with success status and message
 */
export const deleteFEREntry = async (ferEntryId: string) => {
  try {
    const { error } = await supabase
      .from('fer_entries')
      .delete()
      .eq('id', ferEntryId);
    
    if (error) {
      console.error('Error deleting FER entry:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'FER entry deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting FER entry:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Updates a patent's FER completion status based on all FER entries
 * @param patentId - ID of the patent
 * @returns Object with success status and message
 */
export const updatePatentFERCompletionStatus = async (patentId: string) => {
  try {
    // Fetch all FER entries for this patent
    const { data: ferEntries, error } = await supabase
      .from('fer_entries')
      .select('*')
      .eq('patent_id', patentId);
    
    if (error) {
      console.error('Error fetching FER entries:', error);
      return { success: false, message: error.message };
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
      return { success: false, message: updateError.message };
    }
    
    return { success: true, message: 'FER completion status updated successfully' };
  } catch (error: any) {
    console.error('Error updating patent FER completion status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};

/**
 * Approves a FER review (draft or filing)
 * @param ferEntry - FER entry to approve
 * @param reviewType - Type of review (draft or file)
 * @returns Object with success status and message
 */
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
      return { success: false, message: error.message };
    }
    
    // After approving the last FER filing, check if all FERs are complete to update the patent status
    if (reviewType === 'file') {
      await updatePatentFERCompletionStatus(ferEntry.patent_id);
    }
    
    return { success: true, message: `FER ${reviewType} approved successfully` };
  } catch (error: any) {
    console.error(`Error approving FER ${reviewType}:`, error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
};
